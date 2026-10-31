import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as Location from 'expo-location';
import { File } from 'expo-file-system';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';

import { useTheme } from '../../contexts/theme';
import {
  addRecord,
  getCachedAddress,
  cacheAddress,
  getSettings,
  updateSettings,
  saveMediaFile,
} from '../../utils/records';
import { formatAddress, formatCoordinates, formatFileSize, formatDateTime } from '../../utils/geo';

const FLASH_MODES = ['auto', 'on', 'off'];
const FLASH_LABELS = { auto: 'Auto', on: 'On', off: 'Off' };
const BARCODE_TYPES = [
  'qr',
  'ean13',
  'ean8',
  'code128',
  'code39',
  'code93',
  'pdf417',
  'aztec',
  'datamatrix',
  'upc_a',
  'upc_e',
];

function clampZoom(value) {
  return Math.min(1, Math.max(0, value));
}

function CapturedPreview({ capture }) {
  if (capture.type === 'video') {
    return <VideoPreview uri={capture.uri} />;
  }
  return <Image source={{ uri: capture.uri }} style={styles.previewImage} resizeMode="cover" />;
}

function VideoPreview({ uri }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.play();
  });
  return <VideoView player={player} style={styles.previewImage} contentFit="cover" />;
}

export default function CameraScreen() {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const cameraRef = useRef(null);
  const countdownRef = useRef(null);
  const [flashAnim] = useState(() => new Animated.Value(0));
  const zoomBaseRef = useRef(0);

  const [modeType, setModeType] = useState('camera');
  const [facing, setFacing] = useState('back');
  const [flashMode, setFlashMode] = useState('off');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [captureType, setCaptureType] = useState('photo');
  const [zoom, setZoom] = useState(0);
  const [busy, setBusy] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const [settings, setSettings] = useState({
    gridOverlay: false,
    cameraSound: true,
    selfTimer: 0,
    smartCapture: false,
  });
  const [optionsOpen, setOptionsOpen] = useState(false);

  const [countdown, setCountdown] = useState(0);
  const [focusPoint, setFocusPoint] = useState(null);
  const [lastCaptured, setLastCaptured] = useState(null);
  const [locating, setLocating] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);

  const [scanLocked, setScanLocked] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    getSettings().then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  if (!permission) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Loading camera permissions...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Travel Guardian</Text>
        <Text style={[styles.permissionText, { color: colors.textMuted }]}>
          We need camera access so you can take photos, record videos and scan QR codes.
        </Text>
        {permission.canAskAgain ? (
          <Pressable
            style={({ pressed }) => [
              styles.permissionButton,
              { backgroundColor: colors.primary },
              pressed && styles.buttonPressed,
            ]}
            onPress={requestPermission}
          >
            <Text style={[styles.permissionButtonText, { color: colors.onPrimary }]}>
              Grant Camera Permission
            </Text>
          </Pressable>
        ) : (
          <Text style={[styles.permissionText, { color: colors.danger }]}>
            Permission denied. Enable it in device settings to continue.
          </Text>
        )}
      </View>
    );
  }

  const cameraStatus = captureType === 'video' && isRecording
    ? 'Recording...'
    : modeType === 'scanner'
      ? scanLocked
        ? 'Scanner locked'
        : 'Scanning...'
      : zoom > 0
        ? `Zoom ${(1 + zoom * 9).toFixed(1)}x`
        : 'Camera ready';

  const flash = () => {
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 320, useNativeDriver: true }),
    ]).start();
  };

  const toggleFacing = () => setFacing((current) => (current === 'back' ? 'front' : 'back'));

  const cycleFlash = () => {
    setFlashMode((current) => FLASH_MODES[(FLASH_MODES.indexOf(current) + 1) % FLASH_MODES.length]);
  };

  const toggleTorch = () => {
    if (facing !== 'back') {
      Alert.alert('Torch', 'Torch only works with the back camera.');
      return;
    }
    setTorchEnabled((current) => !current);
  };

  const runWithTimer = (action) => {
    if (countdownRef.current || busy) return;
    if (settings.selfTimer === 0) {
      action();
      return;
    }
    let remaining = settings.selfTimer;
    setCountdown(remaining);
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
        setCountdown(0);
        action();
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    setBusy(true);
    try {
      const picture = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        shutterSound: settings.cameraSound,
      });
      flash();
      setCaptureState({ uri: picture.uri, type: 'photo' }, new Date().getTime());
    } catch (error) {
      Alert.alert('Capture error', error.message || 'Could not take photo.');
    } finally {
      setBusy(false);
    }
  };

  const setCaptureState = async (capture, capturedAt) => {
    let size = null;
    try {
      size = new File(capture.uri).size;
    } catch {
      // ignore
    }
    setAutoSaved(false);
    setLastCaptured({
      uri: capture.uri,
      type: capture.type,
      size,
      capturedAt,
      latitude: null,
      longitude: null,
      address: null,
    });
    if (settings.smartCapture) {
      setLocating(true);
      const info = await fetchLocationAndAddress();
      setLocating(false);
      setLastCaptured((current) => ({ ...current, ...info }));
      if (info) {
        await saveCaptured(capture.uri, capture.type, info);
        setAutoSaved(true);
      }
    }
  };

  const fetchLocationAndAddress = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return null;
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = position.coords;
      let address = null;
      const cached = await getCachedAddress(latitude, longitude);
      if (cached) {
        address = cached;
      } else {
        try {
          const result = await Location.reverseGeocodeAsync({ latitude, longitude });
          address = result && result.length ? formatAddress(result[0]) : null;
          if (address) await cacheAddress(latitude, longitude, address);
        } catch {
          address = cached;
        }
      }
      return { latitude, longitude, address };
    } catch {
      return null;
    }
  };

  const saveCaptured = async (uri, type, info) => {
    const id = `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const ext = type === 'video' ? 'mp4' : 'jpg';
    const file = await saveMediaFile(id, uri, ext);
    if (!file) {
      Alert.alert('Save failed', 'Could not copy the file into the app.');
      return null;
    }
    const record = {
      id,
      type,
      uri: file.uri,
      fileName: file.name,
      size: file.size,
      latitude: info ? info.latitude : null,
      longitude: info ? info.longitude : null,
      address: info ? info.address : null,
      favorite: false,
      createdAt: Date.now(),
    };
    await addRecord(record);
    return record;
  };

  const handleSave = async () => {
    if (!lastCaptured) return;
    if (autoSaved) {
      setLastCaptured(null);
      return;
    }
    const record = await saveCaptured(lastCaptured.uri, lastCaptured.type, lastCaptured);
    if (record) {
      setLastCaptured(null);
      Alert.alert('Saved to journal', 'Your capture is now in the Travel Journal.');
    }
  };

  const handleDiscard = () => {
    setLastCaptured(null);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      cameraRef.current?.stopRecording();
      return;
    }
    if (micPermission && !micPermission.granted) {
      const result = await requestMicPermission();
      if (!result.granted) {
        Alert.alert('Microphone needed', 'Grant microphone access to record video with sound.');
        return;
      }
    }
    try {
      setIsRecording(true);
      const video = await cameraRef.current.recordAsync({ maxDuration: 60 });
      flash();
      await setCaptureState({ uri: video.uri, type: 'video' }, new Date().getTime());
    } catch (error) {
      Alert.alert('Record error', error.message || 'Could not record video.');
    } finally {
      setIsRecording(false);
    }
  };

  const onBarcodeScanned = ({ type, data }) => {
    if (scanLocked) return;
    setScanLocked(true);
    setScanResult({ type, data });
  };

  const resetScanner = () => {
    setScanLocked(false);
    setScanResult(null);
  };

  const handleTapToFocus = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    setFocusPoint({ x: locationX, y: locationY });
    setTimeout(() => setFocusPoint(null), 1200);
  };

  const onPinchStateChange = (event) => {
    if (event.nativeEvent.state === State.BEGAN) {
      zoomBaseRef.current = zoom;
    } else if (event.nativeEvent.state === State.ACTIVE) {
      setZoom(clampZoom(zoomBaseRef.current + event.nativeEvent.scale - 1));
    }
  };

  const toggleSetting = async (key, value) => {
    const next = await updateSettings({ [key]: value });
    setSettings(next);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.cameraArea}>
        <PinchGestureHandler onHandlerStateChange={onPinchStateChange}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            flash={flashMode}
            enableTorch={torchEnabled}
            mode={captureType === 'video' && modeType === 'camera' ? 'video' : 'picture'}
            zoom={zoom}
            autofocus={focusPoint ? 'on' : 'off'}
            barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
            onBarcodeScanned={modeType === 'scanner' ? onBarcodeScanned : undefined}
          />
        </PinchGestureHandler>

        {modeType === 'camera' && (
          <Pressable style={StyleSheet.absoluteFill} onPressIn={handleTapToFocus} />
        )}

        {settings.gridOverlay && modeType === 'camera' && (
          <View style={styles.gridOverlay} pointerEvents="none">
            <View style={[styles.gridLine, styles.gridLineVerticalLeft]} />
            <View style={[styles.gridLine, styles.gridLineVerticalRight]} />
            <View style={[styles.gridLine, styles.gridLineHorizontalTop]} />
            <View style={[styles.gridLine, styles.gridLineHorizontalBottom]} />
          </View>
        )}

        {focusPoint && (
          <View
            pointerEvents="none"
            style={[styles.focusRing, { left: focusPoint.x - 40, top: focusPoint.y - 40 }]}
          >
            <View style={styles.focusRingInner} />
          </View>
        )}

        {countdown > 0 && (
          <View style={styles.countdownOverlay} pointerEvents="none">
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}

        <Animated.View
          pointerEvents="none"
          style={[styles.flashView, { opacity: flashAnim }]}
        />
      </View>

      <SafeAreaView style={styles.topBar} edges={['top']}>
        <View style={styles.modeSwitch}>
          {['camera', 'scanner'].map((mode) => (
            <Pressable
              key={mode}
              style={[styles.modeButton, modeType === mode && { backgroundColor: colors.primary }]}
              onPress={() => {
                if (isRecording) {
                  cameraRef.current?.stopRecording();
                  setIsRecording(false);
                }
                setModeType(mode);
                resetScanner();
              }}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  modeType === mode ? { color: colors.onPrimary } : { color: colors.textMuted },
                ]}
              >
                {mode === 'camera' ? 'Camera' : 'Scanner'}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.statusText}>{cameraStatus}</Text>
        <Pressable
          style={styles.iconButton}
          onPress={() => setOptionsOpen(true)}
          accessibilityLabel="Camera options"
        >
          <Ionicons name="options" size={22} color="#fff" />
        </Pressable>
      </SafeAreaView>

      {modeType === 'scanner' && (
        <>
          <View style={styles.scanFrame} pointerEvents="none">
            <View style={[styles.scanCorner, styles.scanCornerTL]} />
            <View style={[styles.scanCorner, styles.scanCornerTR]} />
            <View style={[styles.scanCorner, styles.scanCornerBL]} />
            <View style={[styles.scanCorner, styles.scanCornerBR]} />
          </View>
          <SafeAreaView style={styles.scanResultArea} edges={['bottom']}>
            {scanResult ? (
              <View style={styles.scanResultCard}>
                <Text style={styles.scanResultTitle}>Scanned {scanResult.type.toUpperCase()}</Text>
                <Text style={styles.scanResultData}>{scanResult.data}</Text>
                <Text style={styles.scanResultHint}>Scanning is paused until you reset.</Text>
                <Pressable
                  style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                  onPress={resetScanner}
                >
                  <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>
                    Reset Scanner
                  </Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Text style={styles.scanHint}>Point the camera at a QR code or barcode</Text>
                {scanLocked && (
                  <Pressable
                    style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                    onPress={resetScanner}
                  >
                    <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>
                      Reset Scanner
                    </Text>
                  </Pressable>
                )}
              </>
            )}
          </SafeAreaView>
        </>
      )}

      {modeType === 'camera' && !lastCaptured && (
        <SafeAreaView style={styles.controls} edges={['bottom']}>
          <View style={styles.controlRow}>
            <Pressable
              style={[styles.controlButton, flashMode !== 'off' && { backgroundColor: colors.primary }]}
              onPress={cycleFlash}
            >
              <Ionicons
                name={flashMode === 'on' ? 'flash' : flashMode === 'auto' ? 'flash-outline' : 'flash-off'}
                size={20}
                color={flashMode !== 'off' ? colors.onPrimary : '#fff'}
              />
              <Text
                style={[
                  styles.controlLabel,
                  flashMode !== 'off' ? { color: colors.onPrimary } : { color: colors.textMuted },
                ]}
              >
                {FLASH_LABELS[flashMode]}
              </Text>
            </Pressable>

            <View style={styles.captureGroup}>
              {isRecording && <View style={styles.recordingDot} />}
              <Pressable
                disabled={busy}
                style={({ pressed }) => [
                  styles.shutterButton,
                  captureType === 'video' && styles.shutterButtonVideo,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => {
                  if (isRecording) {
                    toggleRecording();
                    return;
                  }
                  if (captureType === 'photo') runWithTimer(takePhoto);
                  else toggleRecording();
                }}
              >
                {isRecording ? <View style={styles.shutterInnerVideo} /> : <View style={styles.shutterInner} />}
              </Pressable>
            </View>

            <View style={styles.rightControls}>
              <Pressable style={styles.controlButton} onPress={() => setZoom(clampZoom(zoom - 0.1))}>
                <Ionicons name="remove" size={22} color="#fff" />
                <Text style={styles.controlLabel}>Zoom</Text>
              </Pressable>
              <Pressable style={styles.controlButton} onPress={() => setZoom(clampZoom(zoom + 0.1))}>
                <Ionicons name="add" size={22} color="#fff" />
                <Text style={styles.controlLabel}>{(1 + zoom * 9).toFixed(1)}x</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.utilityRow}>
            <Pressable
              style={[
                styles.utilityButton,
                captureType === 'photo' && { backgroundColor: colors.primary },
              ]}
              onPress={() => {
                if (isRecording) cameraRef.current?.stopRecording();
                setCaptureType('photo');
              }}
            >
              <Ionicons
                name="camera"
                size={18}
                color={captureType === 'photo' ? colors.onPrimary : '#fff'}
              />
              <Text
                style={[
                  styles.utilityLabel,
                  captureType === 'photo' && { color: colors.onPrimary },
                ]}
              >
                Photo
              </Text>
            </Pressable>

            <View style={styles.utilityCenterButtons}>
              <Pressable style={styles.utilityButton} onPress={toggleFacing}>
                <Ionicons name="camera-reverse" size={18} color="#fff" />
                <Text style={styles.utilityLabel}>{facing === 'back' ? 'Back' : 'Front'}</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.utilityButton,
                  torchEnabled && { backgroundColor: colors.warning },
                ]}
                onPress={toggleTorch}
              >
                <Ionicons name="flashlight" size={18} color={torchEnabled ? '#fff' : '#fff'} />
                <Text style={styles.utilityLabel}>{torchEnabled ? 'Torch On' : 'Torch'}</Text>
              </Pressable>
            </View>

            <Pressable
              style={[
                styles.utilityButton,
                captureType === 'video' && { backgroundColor: colors.danger },
              ]}
              onPress={() => {
                if (isRecording) cameraRef.current?.stopRecording();
                setIsRecording(false);
                setCaptureType('video');
              }}
            >
              <Ionicons
                name="videocam"
                size={18}
                color={captureType === 'video' ? '#fff' : '#fff'}
              />
              <Text style={styles.utilityLabel}>Video</Text>
            </Pressable>
          </View>

          {settings.smartCapture && (
            <Text style={styles.smartCaptureNote}>Location stamp is ON</Text>
          )}
        </SafeAreaView>
      )}

      {lastCaptured && modeType === 'camera' && (
        <SafeAreaView style={styles.reviewArea} edges={['bottom']}>
          <Pressable style={styles.reviewClose} onPress={handleDiscard}>
            <Ionicons name="close" size={26} color="#fff" />
          </Pressable>
          <View style={styles.reviewCard}>
            <View style={styles.previewWrapper}>
              <CapturedPreview capture={lastCaptured} />
              <View style={styles.watermark} pointerEvents="none">
                <Text style={styles.watermarkTitle}>TRAVEL GUARDIAN</Text>
                <Text style={styles.watermarkLine}>{formatDateTime(lastCaptured.capturedAt)}</Text>
                {lastCaptured.latitude != null && (
                  <Text style={styles.watermarkLine}>
                    {formatCoordinates(lastCaptured.latitude, lastCaptured.longitude)}
                  </Text>
                )}
                {lastCaptured.address && (
                  <Text style={styles.watermarkLine} numberOfLines={2}>
                    {lastCaptured.address}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.reviewInfo}>
              {locating && <Text style={styles.locatingText}>Fetching location & address...</Text>}
              {autoSaved && (
                <Text style={styles.autoSavedText}>
                  Saved to journal{lastCaptured.latitude != null ? ' with location' : ''} ✓
                </Text>
              )}
              <Text style={styles.reviewUriLabel}>Media URI</Text>
              <Text style={styles.reviewUri} numberOfLines={2}>
                {lastCaptured.uri}
              </Text>
              <Text style={styles.reviewMeta}>
                {lastCaptured.type.toUpperCase()} · {formatFileSize(lastCaptured.size)}
                {lastCaptured.type === 'photo' && lastCaptured.width ? ` · ${lastCaptured.width}×${lastCaptured.height}` : ''}
              </Text>
            </View>

            <View style={styles.reviewActions}>
              <Pressable
                style={[styles.reviewButton, styles.reviewButtonSecondary]}
                onPress={handleDiscard}
              >
                <Text style={styles.reviewButtonSecondaryText}>Discard</Text>
              </Pressable>
              <Pressable
                style={[styles.reviewButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
              >
                <Text style={[styles.reviewButtonPrimaryText, { color: colors.onPrimary }]}>
                  {autoSaved ? 'Done' : 'Save to Journal'}
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      )}

      <Modal visible={optionsOpen} transparent animationType="fade" onRequestClose={() => setOptionsOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOptionsOpen(false)}>
          <Pressable style={[styles.optionsPanel, { backgroundColor: colors.surface }]}>
            <Text style={[styles.optionsTitle, { color: colors.text }]}>Camera Options</Text>

            <View style={styles.optionRow}>
              <Text style={[styles.optionLabel, { color: colors.text }]}>Grid overlay</Text>
              <Switch
                value={settings.gridOverlay}
                onValueChange={(value) => toggleSetting('gridOverlay', value)}
                trackColor={{ true: colors.primary }}
              />
            </View>

            <View style={styles.optionRow}>
              <Text style={[styles.optionLabel, { color: colors.text }]}>Shutter sound</Text>
              <Switch
                value={settings.cameraSound}
                onValueChange={(value) => toggleSetting('cameraSound', value)}
                trackColor={{ true: colors.primary }}
              />
            </View>

            <View style={styles.optionRow}>
              <Text style={[styles.optionLabel, { color: colors.text }]}>Self timer</Text>
              <View style={styles.timerOptions}>
                {[0, 3, 5, 10].map((seconds) => (
                  <Pressable
                    key={seconds}
                    style={[
                      styles.timerOption,
                      settings.selfTimer === seconds && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => toggleSetting('selfTimer', seconds)}
                  >
                    <Text
                      style={[
                        styles.timerOptionText,
                        settings.selfTimer === seconds && { color: colors.onPrimary },
                      ]}
                    >
                      {seconds === 0 ? 'Off' : `${seconds}s`}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.optionRow}>
              <View style={styles.optionTextGroup}>
                <Text style={[styles.optionLabel, { color: colors.text }]}>Location stamp</Text>
                <Text style={[styles.optionHint, { color: colors.textSubtle }]}>
                  Capture photo with your current location & address
                </Text>
              </View>
              <Switch
                value={settings.smartCapture}
                onValueChange={(value) => toggleSetting('smartCapture', value)}
                trackColor={{ true: colors.primary }}
              />
            </View>

            <Pressable
              style={[styles.optionDone, { backgroundColor: colors.primary }]}
              onPress={() => setOptionsOpen(false)}
            >
              <Text style={[styles.optionDoneText, { color: colors.onPrimary }]}>Done</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  loadingText: { fontSize: 16 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 16 },
  permissionText: { fontSize: 16, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  permissionButton: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  permissionButtonText: { fontSize: 16, fontWeight: '600' },
  cameraArea: { flex: 1, overflow: 'hidden' },
  camera: { flex: 1 },
  buttonPressed: { opacity: 0.7 },

  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15,23,42,0.7)',
    borderRadius: 999,
    padding: 3,
  },
  modeButton: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  modeButtonText: { fontSize: 13, fontWeight: '700' },
  statusText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: 'rgba(15,23,42,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.7)',
  },

  gridOverlay: { ...StyleSheet.absoluteFillObject, opacity: 0.35 },
  gridLine: { position: 'absolute', backgroundColor: '#fff' },
  gridLineVerticalLeft: { left: '33.33%', top: 0, bottom: 0, width: 1 },
  gridLineVerticalRight: { left: '66.66%', top: 0, bottom: 0, width: 1 },
  gridLineHorizontalTop: { top: '33.33%', left: 0, right: 0, height: 1 },
  gridLineHorizontalBottom: { top: '66.66%', left: 0, right: 0, height: 1 },

  focusRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusRingInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#38bdf8' },

  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    color: '#fff',
    fontSize: 120,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  flashView: { ...StyleSheet.absoluteFillObject, backgroundColor: '#fff' },

  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.75)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 58,
  },
  controlLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '600', marginTop: 2 },
  captureGroup: { alignItems: 'center' },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    marginBottom: 4,
  },
  shutterButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterButtonVideo: { borderColor: '#ef4444' },
  shutterInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff' },
  shutterInnerVideo: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#ef4444' },
  rightControls: { gap: 6 },

  utilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingBottom: 6,
  },
  utilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15,23,42,0.75)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  utilityLabel: { color: '#fff', fontSize: 12, fontWeight: '600' },
  utilityCenterButtons: { flexDirection: 'row', gap: 8 },
  smartCaptureNote: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    paddingBottom: 6,
  },

  scanFrame: {
    position: 'absolute',
    top: '24%',
    left: '18%',
    width: '64%',
    aspectRatio: 1,
  },
  scanCorner: { position: 'absolute', width: 34, height: 34, borderColor: '#38bdf8' },
  scanCornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  scanCornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  scanCornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  scanCornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  scanHint: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(15,23,42,0.75)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  scanResultArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 16,
  },
  scanResultCard: {
    width: '100%',
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  scanResultTitle: { color: '#38bdf8', fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  scanResultData: { color: '#fff', fontSize: 16, marginTop: 8, textAlign: 'center' },
  scanResultHint: { color: '#94a3b8', fontSize: 12, marginTop: 6, marginBottom: 12 },
  primaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  primaryButtonText: { fontSize: 14, fontWeight: '700' },

  reviewArea: {
    position: 'absolute',
    top: 60,
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 12,
    justifyContent: 'flex-end',
  },
  reviewClose: {
    alignSelf: 'flex-end',
    marginBottom: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.8)',
  },
  reviewCard: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewWrapper: { position: 'relative' },
  previewImage: { width: '100%', aspectRatio: 3 / 4 },
  watermark: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  watermarkTitle: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  watermarkLine: { color: '#e2e8f0', fontSize: 12, marginTop: 2 },
  reviewInfo: { padding: 12 },
  locatingText: { color: '#f59e0b', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  autoSavedText: { color: '#22c55e', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  reviewUriLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  reviewUri: { color: '#e2e8f0', fontSize: 12, marginTop: 2 },
  reviewMeta: { color: '#94a3b8', fontSize: 12, marginTop: 6 },
  reviewActions: { flexDirection: 'row', gap: 10, padding: 12, paddingTop: 0 },
  reviewButton: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  reviewButtonSecondary: { backgroundColor: '#1e293b' },
  reviewButtonSecondaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  reviewButtonPrimaryText: { fontSize: 15, fontWeight: '700' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  optionsPanel: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  optionsTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  optionLabel: { fontSize: 15, fontWeight: '600' },
  optionHint: { fontSize: 12, marginTop: 2 },
  optionTextGroup: { flex: 1, marginRight: 12 },
  timerOptions: { flexDirection: 'row', gap: 8 },
  timerOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#1e293b',
  },
  timerOptionText: { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
  optionDone: { marginTop: 18, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  optionDoneText: { fontSize: 15, fontWeight: '700' },
});