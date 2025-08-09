import { NextRequest, NextResponse } from 'next/server'

// Mock face analysis function
function analyzeFace(imageData: string) {
  const emotions = ['happy', 'sad', 'angry', 'surprise', 'neutral', 'fear', 'disgust']
  const genders = ['Man', 'Woman']
  const races = ['asian', 'indian', 'black', 'white', 'middle eastern', 'latino hispanic']
  
  return {
    emotion: emotions[Math.floor(Math.random() * emotions.length)],
    age: Math.floor(Math.random() * 60) + 15,
    gender: genders[Math.floor(Math.random() * genders.length)],
    race: races[Math.floor(Math.random() * races.length)]
  }
}

function generateMalayalamStatus(analysis: any) {
  const funnyTexts: string[] = []
  
  // Emotion-based status
  switch (analysis.emotion) {
    case 'happy':
      funnyTexts.push("ഇന്ന് കല്യാണം കാണാൻ പോയാലോ? 😄")
      break
    case 'sad':
      funnyTexts.push("തള്ളിപ്പോയി അല്ലേ? 😢")
      break
    case 'angry':
      funnyTexts.push("ആരെങ്കിലും വഴക്ക് പറഞ്ഞോ? 😠")
      break
    case 'surprise':
      funnyTexts.push("എന്തോ വലിയ കാര്യം കേട്ടോ? 😲")
      break
    case 'neutral':
      funnyTexts.push("എന്തോ ചിന്തയിൽ ആണല്ലോ 🤔")
      break
    case 'fear':
      funnyTexts.push("എന്തെങ്കിലും പേടിച്ചോ? 😨")
      break
    default:
      funnyTexts.push("നല്ല ലുക്ക് ആണല്ലോ! 😊")
  }
  
  // Age-based status
  if (analysis.age < 18) {
    funnyTexts.push("സ്കൂൾ യൂണിഫോം വെച്ചിട്ടുണ്ടല്ലോ 🎒")
  } else if (analysis.age >= 18 && analysis.age <= 25) {
    funnyTexts.push("കോളേജ് ബങ്ക് അടിക്കുന്ന രൂപം 🎓")
  } else if (analysis.age > 25 && analysis.age <= 35) {
    funnyTexts.push("ജോബിന്റെ ടെൻഷൻ ഉണ്ടല്ലോ 💼")
  } else {
    funnyTexts.push("അനുഭവസമ്പന്നൻ ആണല്ലോ 👨‍🦳")
  }
  
  // Gender-based status
  if (analysis.gender === 'Man') {
    funnyTexts.push("ബെവ്വ് ഉണ്ടാകും ഇത്രയും സ്റ്റൈലിഷ് ആണെങ്കിൽ! 🕺")
  } else {
    funnyTexts.push("കുട്ടി ഞാൻ ഒന്നും പറയില്ല 😜")
  }
  
  return funnyTexts
}

// Generate a simple audio tone as base64 (mock TTS)
function generateMockAudio(): string {
  // Create a simple WAV file header + tone data
  const sampleRate = 22050
  const duration = 2 // 2 seconds
  const samples = sampleRate * duration
  const buffer = new ArrayBuffer(44 + samples * 2)
  const view = new DataView(buffer)
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }
  
  writeString(0, 'RIFF')
  view.setUint32(4, 36 + samples * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, samples * 2, true)
  
  // Generate simple tone
  for (let i = 0; i < samples; i++) {
    const sample = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.3
    view.setInt16(44 + i * 2, sample * 32767, true)
  }
  
  // Convert to base64
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image } = body
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Analyze the face (mock implementation)
    const analysis = analyzeFace(image)
    
    // Generate funny Malayalam text
    const funnyTexts = generateMalayalamStatus(analysis)
    
    // Generate mock audio
    const audioBase64 = generateMockAudio()
    
    return NextResponse.json({
      funny_text: funnyTexts,
      voice: audioBase64,
      analysis: analysis
    })
    
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    )
  }
}
