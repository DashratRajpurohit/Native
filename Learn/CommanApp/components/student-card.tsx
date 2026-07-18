import { Image, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export type StudentDetails = {
  name: string;
  rollNo: string;
  course: string;
  semester: string;
  avatarUri?: string;
};

export type StudentCardProps = {
  student: StudentDetails;
};

export function StudentCard({ student }: StudentCardProps) {
  return (
    <ThemedView style={styles.card}>
      <View style={styles.avatar}>
        {student.avatarUri ? (
          <Image source={{ uri: student.avatarUri }} style={styles.avatarImg} />
        ) : (
          <ThemedText style={styles.avatarText}>
            {student.name
              .split(' ')
              .map((p) => p[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </ThemedText>
        )}
      </View>
      <View style={styles.info}>
        <ThemedText type="subtitle" style={styles.name}>
          {student.name}
        </ThemedText>
        <ThemedText style={styles.detail}>Roll No: {student.rollNo}</ThemedText>
        <ThemedText style={styles.detail}>
          {student.course} · Sem {student.semester}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarImg: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    marginBottom: 4,
  },
  detail: {
    fontSize: 13,
    opacity: 0.65,
  },
});
