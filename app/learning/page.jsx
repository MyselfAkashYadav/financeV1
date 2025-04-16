"use client";

import React, { useState, useEffect } from "react";
import { learningContent } from "../data/learning";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, ChevronRight, BookOpen, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LearningPage() {
  // Initialize progress from localStorage or set to empty object
  const [progress, setProgress] = useState({});
  const [activeTab, setActiveTab] = useState("basics");

  useEffect(() => {
    // Load progress from localStorage on component mount
    const savedProgress = localStorage.getItem("learningProgress");
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, []);

  // Calculate completion percentages
  const calculateCompletion = (section) => {
    const totalTopics = learningContent[section].length;
    const completedTopics = learningContent[section].filter(
      (topic) => progress[topic.id]
    ).length;
    
    return {
      completed: completedTopics,
      total: totalTopics,
      percentage: totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0,
    };
  };

  const basicsCompletion = calculateCompletion("basics");
  const intermediateCompletion = calculateCompletion("intermediate");
  const advancedCompletion = calculateCompletion("advanced");
  const overallCompletion = 
    (basicsCompletion.completed + intermediateCompletion.completed + advancedCompletion.completed) / 
    (basicsCompletion.total + intermediateCompletion.total + advancedCompletion.total) * 100;

  // Toggle completion status for a topic
  const toggleCompletion = (topicId) => {
    const newProgress = { ...progress };
    newProgress[topicId] = !newProgress[topicId];
    
    // Update state and save to localStorage
    setProgress(newProgress);
    localStorage.setItem("learningProgress", JSON.stringify(newProgress));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Financial Learning Path</h1>
        <p className="text-gray-600 mb-4">
          Track your progress as you learn essential financial skills
        </p>
        
        {/* Overall progress */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Overall Progress</h3>
              <span className="text-sm text-muted-foreground">
                {Math.round(overallCompletion)}% Complete
              </span>
            </div>
            <Progress value={overallCompletion} className="h-2" />
            <div className="flex justify-between mt-4 text-sm text-muted-foreground">
              <div>Basics: {basicsCompletion.completed}/{basicsCompletion.total}</div>
              <div>Intermediate: {intermediateCompletion.completed}/{intermediateCompletion.total}</div>
              <div>Advanced: {advancedCompletion.completed}/{advancedCompletion.total}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="basics" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {["basics", "intermediate", "advanced"].map((level) => (
          <TabsContent key={level} value={level}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {learningContent[level].map((topic) => (
                <Card 
                  key={topic.id}
                  className={`transition-all hover:shadow-md ${
                    progress[topic.id] ? "border-green-500 bg-green-50" : ""
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{topic.icon}</span>
                        <CardTitle className="text-lg">{topic.title}</CardTitle>
                      </div>
                      {progress[topic.id] ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          In Progress
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{topic.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {topic.estimatedTime}
                        </div>
                        {topic.links && topic.links.length > 0 && (
                          <div className="flex items-center">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            {topic.links.length} Resources
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant={progress[topic.id] ? "outline" : "default"}
                          onClick={() => toggleCompletion(topic.id)}
                          size="sm"
                        >
                          {progress[topic.id] ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark Incomplete
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark Complete
                            </>
                          )}
                        </Button>
                        <Link href={`/learning/${topic.id}`}>
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}