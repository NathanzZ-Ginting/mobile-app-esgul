import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { TextInput, Button } from 'react-native-paper'

interface AuthFormProps {
  title: string
  onSubmit: (credentials: Record<string, string>) => void
  fields: {
    name: string
    label: string
    placeholder: string
    secureTextEntry?: boolean
  }[]
  isLoading?: boolean
  buttonText?: string
}

export const AuthForm: React.FC<AuthFormProps> = ({
  title,
  onSubmit,
  fields,
  isLoading = false,
  buttonText = 'Submit',
}) => {
  const [values, setValues] = React.useState(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
  )

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    onSubmit(values)
  }

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      {fields.map((field) => (
        <View key={field.name} style={styles.inputContainer}>
          <TextInput
            label={field.label}
            placeholder={field.placeholder}
            value={values[field.name]}
            onChangeText={(text) => handleChange(field.name, text)}
            secureTextEntry={field.secureTextEntry}
            style={styles.input}
            mode="outlined"
            editable={!isLoading}
            outlineColor="#e8e8e8"
            activeOutlineColor="#2c5aa0"
            textColor="#1a1a1a"
            placeholderTextColor="#a0a0a0"
            theme={{
              colors: {
                primary: '#2c5aa0',
                background: '#ffffff',
                surface: '#ffffff',
              },
            }}
          />
        </View>
      ))}
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
        buttonColor="#2c5aa0"
        textColor="#ffffff"
        labelStyle={styles.buttonLabel}
      >
        {buttonText}
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  inputContainer: {
    marginVertical: 4,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    fontSize: 14,
  },
  button: {
    marginTop: 16,
    paddingVertical: 6,
    borderRadius: 10,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
})
