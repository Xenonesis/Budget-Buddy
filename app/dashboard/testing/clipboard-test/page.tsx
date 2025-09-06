"use client"

import { useState } from "react"
import { CopyButton } from "@/components/ui/copy-button"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function ClipboardTestPage() {
  const [text, setText] = useState("This is sample text to copy")
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Clipboard Test Page</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Copy Button Component</CardTitle>
            <CardDescription>
              Tests the new CopyButton component with proper fallbacks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <Label htmlFor="textToCopy">Text to copy:</Label>
                <Input 
                  id="textToCopy"
                  value={text} 
                  onChange={(e) => setText(e.target.value)} 
                  className="flex-1"
                />
              </div>
              
              <div className="flex gap-4 items-center">
                <span className="font-medium">Try copying:</span>
                <div className="flex items-center border rounded-md p-2 flex-1 bg-muted/30">
                  <span className="flex-1 truncate">{text}</span>
                  <CopyButton 
                    text={text} 
                    onCopy={() => console.log("Text copied:", text)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              This uses our new clipboard hook with multiple fallback methods for better browser compatibility
            </p>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Implementation Details</CardTitle>
            <CardDescription>
              How the clipboard functionality works
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Primary Method</h3>
              <p className="text-sm text-muted-foreground">
                Uses the modern Clipboard API (navigator.clipboard)
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Fallback Method</h3>
              <p className="text-sm text-muted-foreground">
                Falls back to document.execCommand('copy') with a hidden textarea for older browsers
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Visual Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Provides clear visual feedback with status icons and tooltips
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
            >
              Back
            </Button>
            <Button
              onClick={() => setText("This is sample text to copy")}
            >
              Reset Text
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 