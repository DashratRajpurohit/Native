import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';

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
    <View style={styles.card}>
      <View style={styles.avatar}>
        {student.avatarUri ? (
          <Image source={{ uri: student.avatarUri }} style={styles.avatarImg} />
        ) : (
          <Text style={styles.avatarText}>
            {student.name
              .split(' ')
              .map((p) => p[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </Text>
        )}
      </View>
      <View style={styles.info}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>STUDENT INSPECTOR</Text>
        </View>
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.detail}>Roll No: {student.rollNo}</Text>
        <Text style={styles.detail}>
          {student.course} · Semester {student.semester}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    marginBottom: 18,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarImg: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  avatarText: {
    color: Colors.dark,
    fontSize: 22,
    fontWeight: '900',
  },
  info: {
    flex: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.dark,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  badgeText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.dark,
    marginBottom: 2,
  },
  detail: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textMuted,
  },
});
