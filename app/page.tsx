'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Camera, Play, Pause, Volume2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AnalysisResult {
  funny_text: string[]
  voice: string
  analysis: {
    emotion: string
    age: number
    gender: string
    race: string
  }
}

export default function FunnyFaceAnalyzer() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setResult(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async () => {
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Please select an image first",
        variant: "destructive"
      })
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: selectedImage }),
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const data = await response.json()
      setResult(data)
      
      toast({
        title: "Analysis Complete!",
        description: "Your funny Malayalam status is ready!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze image. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const playAudio = () => {
    if (!result?.voice) return

    if (audio) {
      audio.pause()
      setAudio(null)
      setIsPlaying(false)
      return
    }

    try {
      // Convert base64 to blob
      const binaryString = atob(result.voice)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      
      const audioBlob = new Blob([bytes], { type: 'audio/wav' })
      const audioUrl = URL.createObjectURL(audioBlob)
      const newAudio = new Audio(audioUrl)
      
      newAudio.onended = () => {
        setIsPlaying(false)
        setAudio(null)
        URL.revokeObjectURL(audioUrl)
      }
      
      newAudio.onerror = () => {
        console.error('Audio playback error')
        setIsPlaying(false)
        setAudio(null)
        URL.revokeObjectURL(audioUrl)
      }
      
      newAudio.play().catch(error => {
        console.error('Failed to play audio:', error)
        setIsPlaying(false)
        setAudio(null)
        URL.revokeObjectURL(audioUrl)
      })
      
      setAudio(newAudio)
      setIsPlaying(true)
    } catch (error) {
      console.error('Error creating audio:', error)
      toast({
        title: "Audio Error",
        description: "Failed to play audio. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Funny Face Analyzer
          </h1>
          <p className="text-lg text-gray-600">
            Upload your photo and get a funny Malayalam status with voice!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Upload Your Photo
              </CardTitle>
              <CardDescription>
                Select a clear photo of your face for analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {selectedImage ? (
                  <div className="space-y-4">
                    <img
                      src={selectedImage || "/placeholder.svg"}
                      alt="Selected"
                      className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setSelectedImage(null)}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 mx-auto text-gray-400" />
                    <div>
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Button asChild>
                          <span>Choose Image</span>
                        </Button>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Supports JPG, PNG, and other image formats
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={analyzeImage}
                disabled={!selectedImage || isAnalyzing}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Face'}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Analysis Results
              </CardTitle>
              <CardDescription>
                Your funny Malayalam status and voice
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-6">
                  {/* Analysis Details */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Face Analysis:</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Emotion: <span className="font-medium">{result.analysis.emotion}</span></div>
                      <div>Age: <span className="font-medium">{result.analysis.age}</span></div>
                      <div>Gender: <span className="font-medium">{result.analysis.gender}</span></div>
                      <div>Race: <span className="font-medium">{result.analysis.race}</span></div>
                    </div>
                  </div>

                  {/* Funny Text */}
                  <div>
                    <h3 className="font-semibold mb-3">Funny Malayalam Status:</h3>
                    <div className="space-y-2">
                      {result.funny_text.map((text, index) => (
                        <div
                          key={index}
                          className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400"
                        >
                          <p className="text-gray-800 font-medium">{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Audio Player */}
                  <div className="text-center">
                    <Button
                      onClick={playAudio}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-5 h-5 mr-2" />
                          Stop Audio
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Play Malayalam Voice
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Upload and analyze an image to see results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <Upload className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold mb-1">1. Upload Photo</h3>
                <p className="text-sm text-gray-600">Select a clear photo of your face</p>
              </div>
              <div className="text-center p-4">
                <Camera className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold mb-1">2. AI Analysis</h3>
                <p className="text-sm text-gray-600">AI analyzes emotion, age, gender, and race</p>
              </div>
              <div className="text-center p-4">
                <Volume2 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold mb-1">3. Funny Status</h3>
                <p className="text-sm text-gray-600">Get funny Malayalam text and voice</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
