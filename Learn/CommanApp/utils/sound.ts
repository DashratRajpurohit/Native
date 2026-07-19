 import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

let soundInstance: Audio.Sound | null = null;

export async function playShutterSound(isCustom: boolean): Promise<void> {
  try {
    if (isCustom) {
      // Play custom audiomass-output.wav sound from assets
      if (soundInstance) {
        await soundInstance.unloadAsync().catch(() => {});
        soundInstance = null;
      }
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/audiomass-output.wav'),
        { shouldPlay: true, volume: 1.0 }
      );
      soundInstance = sound;
      await sound.playAsync();
    } else {
      // Play normal default camera shutter feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  } catch (error) {
    console.warn('Error playing shutter sound:', error);
    // Fallback to haptics on error
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }
}
