import React, { useState, useEffect } from "react";
import { Bell, Calendar, Frame, MapPin, Percent, Hotel } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Dashboard = () => {
  const [occupancyData, setOccupancyData] = useState([]);
  const [competitorPrices, setCompetitorPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchCompetitorPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/prices');
      if (!response.ok) throw new Error('Failed to fetch prices');
      const data = await response.json();
      setCompetitorPrices(data.data || []);
    } catch (err) {
      setError('Failed to fetch competitor prices. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOccupancyData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/occupancy');
      if (!response.ok) throw new Error('Failed to fetch occupancy data');
      const data = await response.json();
      
      // Transform data for chart
      const transformedData = Object.entries(data.data || {}).map(([date, value]) => ({
        date,
        occupancy: value
      }));
      
      setOccupancyData(transformedData);
    } catch (err) {
      setError('Failed to fetch occupancy data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      const text = await file.text();
      const data = {};
      
      text.split('\n').forEach(line => {
        const [date, value] = line.split(':').map(s => s.trim());
        if (date && value) {
          data[date] = parseInt(value, 10);
        }
      });

      const response = await fetch('/api/occupancy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to upload data');
      
      // Refresh occupancy data
      await fetchOccupancyData();
    } catch (err) {
      setError('Failed to upload file. Please check the file format and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitorPrices();
    fetchOccupancyData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6">
        <Frame className="w-6 h-6" />
        <span className="ml-2 text-lg font-semibold">Phakalane Golf Estate Hotel</span>
        <nav className="ml-auto flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Avatar>
            <AvatarImage src="/api/placeholder/32/32" alt="Avatar" />
            <AvatarFallback>PH</AvatarFallback>
          </Avatar>
        </nav>
      </header>

      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-[200px]"
            />
            <Input
              type="file"
              onChange={handleFileUpload}
              accept=".txt"
              className="w-[200px]"
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Weekly Occupancy Rate</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={occupancyData}>
                      <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip />
                      <Bar dataKey="occupancy" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="competitors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Competitor Prices</CardTitle>
                <CardDescription>Current rates for hotels in Gaborone</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <p>Loading...</p>
                  ) : (
                    competitorPrices.map((competitor, index) => (
                      <div key={index} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                        <div className="flex items-center space-x-4">
                          <div className="rounded-full bg-primary/10 p-2">
                            <Hotel className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{competitor.name}</p>
                          </div>
                        </div>
                        <div className="text-sm font-semibold">
                          {competitor.currency} {competitor.price.toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;