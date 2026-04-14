import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Alert, Text } from 'react-native'
import { TextInput, Button, RadioButton } from 'react-native-paper'

export const FeedbackScreen: React.FC = () => {
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const [status, setStatus] = useState<'safe' | 'issue'>('safe')

  const handleSubmit = () => {
    if (!review.trim()) {
      Alert.alert('Error', 'Please enter a review')
      return
    }

    if (status === 'safe') {
      Alert.alert('Thank You', 'Your feedback has been recorded. Thank you!')
      setReview('')
      setRating(5)
      setStatus('safe')
    } else {
      Alert.alert(
        'Support',
        'Opening chat with support team...'
      )
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Service Feedback</Text>

        <View style={styles.ratingSection}>
          <Text style={styles.label}>Rating</Text>
          <View style={styles.ratingButtons}>
            {[1, 2, 3, 4, 5].map((r) => (
              <Button
                key={r}
                mode={rating === r ? 'contained' : 'outlined'}
                onPress={() => setRating(r)}
                style={styles.ratingButton}
              >
                {r} ⭐
              </Button>
            ))}
          </View>
        </View>

        <TextInput
          label="Your Review"
          value={review}
          onChangeText={setReview}
          multiline
          numberOfLines={4}
          style={[styles.input, styles.reviewInput]}
          placeholder="Tell us about your experience..."
        />

        <View style={styles.statusSection}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.radioGroup}>
            <View style={styles.radioOption}>
              <RadioButton
                value="safe"
                status={status === 'safe' ? 'checked' : 'unchecked'}
                onPress={() => setStatus('safe')}
              />
              <Text style={styles.radioLabel}>Sudah Aman ✓</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton
                value="issue"
                status={status === 'issue' ? 'checked' : 'unchecked'}
                onPress={() => setStatus('issue')}
              />
              <Text style={styles.radioLabel}>Ada Masalah</Text>
            </View>
          </View>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
        >
          Submit Feedback
        </Button>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingVertical: 24,
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  ratingSection: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  ratingButton: {
    flex: 1,
    minWidth: '18%',
  },
  input: {
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  reviewInput: {
    textAlignVertical: 'top',
  },
  statusSection: {
    gap: 12,
  },
  radioGroup: {
    gap: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  submitButton: {
    marginVertical: 8,
    paddingVertical: 6,
  },
})
