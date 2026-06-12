import { StyleSheet, Text, View } from 'react-native';

export default function CommunityScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>동네생활</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 18, color: '#888' },
});
