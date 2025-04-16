"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { learningContent } from "./../../data/learning";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Clock, ExternalLink, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TopicPage() {
  const params = useParams();
  const router = useRouter();
  const { topicId } = params;
  
  const [progress, setProgress] = useState({});
  const [topic, setTopic] = useState(null);

  useEffect(() => {
    // Find the topic in our content
    let foundTopic = null;
    Object.keys(learningContent).forEach(level => {
      const found = learningContent[level].find(t => t.id === topicId);
      if (found) foundTopic = { ...found, level };
    });

    if (foundTopic) {
      setTopic(foundTopic);
    } else {
      // Redirect if topic not found
      router.push('/learning');
    }

    // Load progress
    const savedProgress = localStorage.getItem("learningProgress");
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, [topicId, router]);

  if (!topic) {
    return <div className="container mx-auto py-8 px-4">Loading...</div>;
  }

  const toggleCompletion = () => {
    const newProgress = { ...progress };
    newProgress[topicId] = !newProgress[topicId];
    
    // Update state and save to localStorage
    setProgress(newProgress);
    localStorage.setItem("learningProgress", JSON.stringify(newProgress));
  };

  // Create mock content based on the topic
  const mockContent = [
    {
      title: "Introduction",
      content: `Welcome to ${topic.title}! This module will help you understand the key concepts and practical applications of this important financial topic.`
    },
    {
      title: "Key Concepts",
      content: "In this section, we'll explore the fundamental principles that make up this topic. Understanding these concepts will provide you with a solid foundation for making informed financial decisions."
    },
    {
      title: "Practical Applications",
      content: "Theory is important, but application is where real learning happens. In this section, we'll cover how to apply these concepts in your everyday financial life."
    },
    {
      title: "Common Mistakes to Avoid",
      content: "Many people make the same mistakes when dealing with this topic. We'll highlight these pitfalls so you can recognize and avoid them."
    },
    {
      title: "Next Steps",
      content: "Now that you understand the basics, here are some recommended actions to take to implement what you've learned."
    }
  ];

  const levelColors = {
    basics: "blue",
    intermediate: "purple",
    advanced: "orange"
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        variant="ghost" 
        onClick={() => router.push('/learning')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Learning Path
      </Button>
      
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{topic.icon}</span>
          <h1 className="text-3xl font-bold">{topic.title}</h1>
        </div>
        
        <div className="flex items-center gap-3 mt-2">
          <Badge 
            className={`bg-${levelColors[topic.level]}-100 text-${levelColors[topic.level]}-800`}
          >
            {topic.level.charAt(0).toUpperCase() + topic.level.slice(1)}
          </Badge>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            {topic.estimatedTime}
          </div>
          
          <Badge 
            variant="outline" 
            className={progress[topicId] ? "bg-green-100 text-green-800" : ""}
          >
            {progress[topicId] ? "Completed" : "Not Completed"}
          </Badge>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <p className="text-lg">{topic.description}</p>
        </CardContent>
      </Card>
      
      {mockContent.map((section, index) => (
        <Card key={index} className="mb-6">
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{section.content}</p>
          </CardContent>
        </Card>
      ))}

      {/* Resource Links Section */}
      {topic.links && topic.links.length > 0 && (
        <Card className="mb-8 border-blue-200">
          <CardHeader className="bg-blue-50">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <CardTitle>Additional Resources</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4">
              {topic.links.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-md hover:bg-slate-50">
                  <div className="font-medium">{link.title}</div>
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    View Resource <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="bg-blue-50 text-sm text-blue-700">
            These external resources provide additional perspectives and information on
          </CardFooter>
        </Card>
      )}
      
      <div className="flex justify-center mt-8">
        <Button 
          onClick={toggleCompletion}
          size="lg"
          className={progress[topicId] ? "bg-green-600 hover:bg-green-700" : ""}
        >
          <CheckCircle className="mr-2 h-5 w-5" />
          {progress[topicId] ? "Mark as Incomplete" : "Mark as Complete"}
        </Button>
      </div>
    </div>
  );
}