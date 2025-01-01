"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface VideoData {
  title: string;
  views: number;
  thumbnail: string;
}

interface GraphData {
  name: string;
  views: number;
}

export default function Home() {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [videoData, setVideoData] = useState<VideoData[]>([]);
  const [graphData, setGraphData] = useState<GraphData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeGraph, setActiveGraph] = useState<"line" | "bar" | "pie">("line");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/scrape-playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playlistUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch playlist data");
      }

      const data = await response.json();
      setVideoData(data.videoList);
      setGraphData(data.graphData);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f0e", "#d62728"];

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>YouTube Playlist Analyzer</CardTitle>
          <CardDescription>
            Enter a YouTube playlist URL to analyze its videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="url"
              placeholder="Enter YouTube playlist URL"
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              required
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Analyzing..." : "Analyze Playlist"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {videoData.length > 0 && (
        <>
          <div className="flex justify-center space-x-4 my-6">
            <Button
              variant={activeGraph === "line" ? "primary" : "secondary"}
              onClick={() => setActiveGraph("line")}
            >
              Line Graph
            </Button>
            <Button
              variant={activeGraph === "bar" ? "primary" : "secondary"}
              onClick={() => setActiveGraph("bar")}
            >
              Bar Graph
            </Button>
            <Button
              variant={activeGraph === "pie" ? "primary" : "secondary"}
              onClick={() => setActiveGraph("pie")}
            >
              Pie Chart
            </Button>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Graphical Representation</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                {activeGraph === "line" && (
                  <LineChart
                    data={graphData}
                    margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={formatYAxis} />
                    <Tooltip formatter={(value) => formatYAxis(Number(value))} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                )}
                {activeGraph === "bar" && (
                  <BarChart
                    data={graphData}
                    margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={formatYAxis} />
                    <Tooltip formatter={(value) => formatYAxis(Number(value))} />
                    <Legend />
                    <Bar dataKey="views" fill="#8884d8" />
                  </BarChart>
                )}
                {activeGraph === "pie" && (
                  <PieChart>
                    <Pie
                      data={graphData}
                      dataKey="views"
                      nameKey="name"
                      outerRadius={150}
                      fill="#8884d8"
                      label
                    >
                      {graphData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatYAxis(Number(value))} />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoData.map((video, index) => (
              <Card key={index}>
                <CardHeader>
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-40 object-cover rounded-t"
                  />
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-lg truncate">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatYAxis(video.views)} views
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
