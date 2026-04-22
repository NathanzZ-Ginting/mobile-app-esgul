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
            style={[styles.input, { color: '#e0e0e0' }]}
            mode="outlined"
            editable={!isLoading}
            outlineColor="#666666"
            activeOutlineColor="#8B6914"
            textColor="#e0e0e0"
            placeholderTextColor="#999999"
            cursorColor="#8B6914"
            theme={{
              colors: {
                primary: '#8B6914',
                onSurfaceVariant: '#999999',
                background: 'rgba(45, 45, 45, 0.95)',
                surface: 'rgba(45, 45, 45, 0.95)',
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
        buttonColor="#6B5D47"
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
    marginVertical: 3,
  },
  input: {
    backgroundColor: 'rgba(55, 55, 55, 0.95)',
    borderRadius: 10,
    fontSize: 14,
    color: '#e0e0e0',
  },
  label: {
    fontSize: 12,
    color: '#999999',
  },
  button: {
    marginTop: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
})
