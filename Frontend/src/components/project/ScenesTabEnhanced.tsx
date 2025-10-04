"use client"

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, AlertTriangle, Users, Upload, FileText, Edit, Calendar, Search, Filter, RefreshCw } from 'lucide-react';
import api from '@/services/api/client';
import ScriptUploadModal from './ScriptUploadModal';
import SceneEditModal from './SceneEditModal';

interface Scene {
  id: string | number;
  scene_number?: string;
  scene_heading?: string;
  location_name?: string;
  location_type?: string;
  time_of_day?: string;
  estimated_duration?: string;
  status?: string;
  actors_data?: any[];
  props_data?: any[];
  location_data?: any;
  crowd_data?: any;
  time_data?: any;
  technical_notes?: string;
  estimated_cost?: number;
  actual_cost?: number;
  created_at?: string;
  // Legacy fields for backward compatibility
  seq?: number;
  slugline?: string;
  interior?: boolean;
  location?: string;
  actors?: string[];
  props?: string[];
  crowd_estimate?: number;
  duration_minutes?: number;
  vfx?: boolean;
  ai_confidence?: number;
  notes?: string;
}

interface ScenesTabProps {
  projectId: string;
  scenes?: Scene[]; // Optional, not used anymore - component loads its own data
}

export default function ScenesTab({ projectId, scenes: passedScenes }: ScenesTabProps) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [filteredScenes, setFilteredScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    // Always load scenes from API to get full details
    // Don't rely on passed scenes as they might have limited data
    loadScenes();
  }, [projectId]);

  useEffect(() => {
    filterScenes();
  }, [scenes, searchTerm, locationFilter, timeFilter]);

  const filterScenes = () => {
    let filtered = scenes;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(scene => 
        scene.scene_heading?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scene.location_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scene.scene_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scene.actors_data?.some((actor: any) => 
          (typeof actor === 'string' ? actor : actor.name)?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(scene => scene.location_type === locationFilter);
    }

    // Time filter
    if (timeFilter !== 'all') {
      filtered = filtered.filter(scene => scene.time_of_day?.toLowerCase() === timeFilter);
    }

    setFilteredScenes(filtered);
  };

  const loadScenes = async () => {
    try {
      setLoading(true);
      console.log('Loading scenes for project:', projectId);
      console.log('Using API endpoint: /api/scenes/projects/' + projectId + '/scenes');
      console.log('Loading full scene details from API...');
      const data = await api.getScenes(projectId);
      console.log('Scenes loaded successfully:', data);
      console.log('Number of scenes:', data?.length || 0);
      setScenes(data || []);
      setFilteredScenes(data || []);
    } catch (error) {
      console.error('Failed to load scenes:', error);
      console.error('Error details:', error);
      setScenes([]);
      setFilteredScenes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSceneEdit = (scene: Scene) => {
    setSelectedScene(scene);
    setEditModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTimeOfDayColor = (time: string) => {
    switch (time?.toLowerCase()) {
      case 'day': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'night': return 'bg-blue-900/20 text-blue-300 border-blue-700/30';
      case 'morning': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'evening': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-accent-primary font-medium flex items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-primary mr-3"></div>
          🎬 Loading scenes...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-accent-secondary flex items-center">
            🎬 Scenes
          </h2>
          <p className="text-text-secondary text-sm mt-1 flex items-center">
            📊 {scenes.length} scenes extracted from script
            {filteredScenes.length !== scenes.length && ` • ${filteredScenes.length} matching filters`}
          </p>
          <p className="text-accent-brown text-xs mt-1">
            🔗 API: /api/scenes/projects/{projectId}/scenes
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            size="sm"
            onClick={loadScenes}
            disabled={loading}
            className="border-accent-brown text-accent-secondary hover:bg-accent-brown/20 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            🔄 Refresh
          </Button>
          <Button 
            onClick={() => setUploadModalOpen(true)}
            className="bg-accent-primary text-primary-bg hover:bg-accent-primary/80 font-medium transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            📤 Upload Script
          </Button>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      {scenes.length > 0 && (
        <Card className="bg-gradient-to-r from-secondary-bg/80 to-primary-bg/60 border-accent-brown shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent-primary w-4 h-4" />
                <Input
                  placeholder="🔍 Search scenes, locations, actors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-secondary-bg/50 border-accent-brown/30 text-accent-secondary focus:border-accent-primary transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-40 bg-secondary-bg/50 border-accent-brown/30 text-accent-secondary focus:border-accent-primary">
                    <SelectValue placeholder="📍 Location" />
                  </SelectTrigger>
                  <SelectContent className="bg-primary-bg border-accent-brown">
                    <SelectItem value="all">🌐 All Locations</SelectItem>
                    <SelectItem value="indoor">🏠 Indoor</SelectItem>
                    <SelectItem value="outdoor">🌅 Outdoor</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-32 bg-secondary-bg/50 border-accent-brown/30 text-accent-secondary focus:border-accent-primary">
                    <SelectValue placeholder="🕐 Time" />
                  </SelectTrigger>
                  <SelectContent className="bg-primary-bg border-accent-brown">
                    <SelectItem value="all">🌍 All Times</SelectItem>
                    <SelectItem value="day">☀️ Day</SelectItem>
                    <SelectItem value="night">🌙 Night</SelectItem>
                    <SelectItem value="morning">🌅 Morning</SelectItem>
                    <SelectItem value="evening">🌇 Evening</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Scenes Overview */}
      {scenes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-accent-primary/20 to-accent-secondary/10 border-accent-primary/30 hover:shadow-lg hover:shadow-accent-primary/20 transition-all duration-300">
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-accent-primary flex items-center">
                🎬 {filteredScenes.length}
              </div>
              <div className="text-sm text-text-secondary">
                {filteredScenes.length === scenes.length ? 'Total Scenes' : 'Filtered Scenes'}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent-secondary/20 to-accent-brown/10 border-accent-secondary/30 hover:shadow-lg hover:shadow-accent-secondary/20 transition-all duration-300">
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-accent-secondary flex items-center">
                🏠 {filteredScenes.filter(s => s.location_type === 'indoor' || s.interior).length}
              </div>
              <div className="text-sm text-text-secondary">Interior Scenes</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent-brown/20 to-accent-primary/10 border-accent-brown/30 hover:shadow-lg hover:shadow-accent-brown/20 transition-all duration-300">
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-accent-brown flex items-center">
                🌅 {filteredScenes.filter(s => s.location_type === 'outdoor' || (!s.interior && s.interior !== undefined)).length}
              </div>
              <div className="text-sm text-text-secondary">Exterior Scenes</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent-primary/15 to-accent-secondary/15 border-accent-primary/20 hover:shadow-lg hover:shadow-accent-primary/20 transition-all duration-300">
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-accent-primary flex items-center">
                ✨ {filteredScenes.filter(s => s.technical_notes || (s.actors_data && s.actors_data.some((a: any) => a.vfx))).length}
              </div>
              <div className="text-sm text-text-secondary">Special Scenes</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Empty State */}
      {scenes.length === 0 && !loading && (
        <Card className="bg-gradient-to-br from-secondary-bg/50 to-primary-bg/30 border-dashed border-accent-brown/50 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="text-8xl mb-6">🎬</div>
            <h3 className="text-2xl font-bold text-accent-secondary mb-3">No Scenes Yet</h3>
            <p className="text-text-secondary mb-8 max-w-md mx-auto leading-relaxed">
              📄 Upload your film script PDF and our AI will automatically extract scenes,
              characters, props, locations, and more to kickstart your production planning.
            </p>
            <Button 
              onClick={() => setUploadModalOpen(true)}
              className="bg-accent-primary text-primary-bg hover:bg-accent-primary/80 font-medium px-8 py-3 text-lg transition-colors"
            >
              <Upload className="w-5 h-5 mr-3" />
              📤 Upload Script PDF
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Enhanced No Results State */}
      {scenes.length > 0 && filteredScenes.length === 0 && !loading && (
        <Card className="bg-gradient-to-br from-secondary-bg/50 to-primary-bg/30 border-accent-brown/50 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-accent-secondary mb-3">No Scenes Match Your Filters</h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              🎯 Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('all');
                setTimeFilter('all');
              }}
              className="border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-primary-bg font-medium transition-colors"
            >
              🗑️ Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Scenes Grid */}
      {filteredScenes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredScenes.map((scene) => (
            <Card 
              key={scene.id} 
              className="bg-gradient-to-br from-secondary-bg/80 to-primary-bg/60 border-accent-brown shadow-lg hover:border-accent-primary/50 transition-all hover:shadow-xl hover:shadow-accent-primary/20 transform hover:-translate-y-1"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-accent-primary border-accent-primary/50 font-mono text-xs bg-accent-primary/10">
                        🎬 {scene.scene_number || `Scene ${scene.seq || scene.id}`}
                      </Badge>
                      <Badge className={`${getTimeOfDayColor(scene.time_of_day || 'day')} font-medium`}>
                        {scene.time_of_day === 'day' ? '☀️' : 
                         scene.time_of_day === 'night' ? '🌙' : 
                         scene.time_of_day === 'morning' ? '🌅' : 
                         scene.time_of_day === 'evening' ? '🌇' : '🕐'} {(scene.time_of_day || 'DAY').toUpperCase()}
                      </Badge>
                      {scene.location_type && (
                        <Badge variant="secondary" className="text-xs bg-accent-brown/20 text-accent-brown border-accent-brown/30">
                          {scene.location_type === 'indoor' ? '🏠' : '🌅'} {scene.location_type.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-accent-secondary text-base font-bold leading-tight">
                      {scene.scene_heading || 
                       `${(scene.location_type === 'indoor' || scene.interior) ? 'INT.' : 'EXT.'} ${scene.location_name || scene.location || 'Unknown Location'}`}
                    </CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-accent-brown hover:text-accent-primary p-1 hover:bg-accent-primary/20 rounded-full transition-colors"
                    onClick={() => handleSceneEdit(scene)}
                    title="Edit Scene"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Enhanced Location Details */}
                {scene.location_name && (
                  <div className="flex items-center gap-2 text-sm text-accent-secondary mb-2">
                    <MapPin className="w-4 h-4 text-accent-primary" />
                    <span className="font-medium">📍 {scene.location_name}</span>
                    {scene.location_data?.specific_details && (
                      <span className="text-text-secondary">• {scene.location_data.specific_details}</span>
                    )}
                  </div>
                )}

                {/* Enhanced Time & Duration */}
                <div className="flex items-center gap-4 text-xs text-text-secondary">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-accent-secondary" />
                    <span>⏱️ {scene.estimated_duration || 'Unknown duration'}</span>
                  </div>
                  {scene.time_data?.specific_time && (
                    <span>🕐 {scene.time_data.specific_time}</span>
                  )}
                  {scene.time_data?.weather && (
                    <span>• 🌤️ {scene.time_data.weather}</span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Enhanced Scene Description/Notes */}
                {(scene.technical_notes || scene.notes) && (
                  <div className="bg-secondary-bg/50 p-3 rounded-lg border-l-4 border-accent-primary">
                    <div className="text-xs font-semibold text-accent-primary mb-2 flex items-center">
                      📝 Scene Notes
                    </div>
                    <div className="text-xs text-accent-secondary leading-relaxed">
                      {scene.technical_notes || scene.notes}
                    </div>
                  </div>
                )}

                {/* Enhanced Cast Section */}
                {scene.actors_data && scene.actors_data.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-accent-primary" />
                      <span className="text-sm font-semibold text-accent-primary">🎭 Cast ({scene.actors_data.length})</span>
                    </div>
                    <div className="space-y-2">
                      {scene.actors_data.slice(0, 6).map((actor: any, idx: number) => (
                        <div key={idx} className="flex items-start justify-between p-3 bg-primary-bg/50 rounded-lg border border-accent-brown/20">
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-accent-secondary">
                              🎭 {typeof actor === 'string' ? actor : actor.name || 'Unknown Actor'}
                            </div>
                            {typeof actor === 'object' && actor.description && (
                              <div className="text-xs text-text-secondary mt-1">
                                {actor.description}
                              </div>
                            )}
                          </div>
                          {typeof actor === 'object' && actor.role && (
                            <Badge variant="outline" className="text-xs ml-2 border-accent-primary text-accent-primary">
                              {actor.role}
                            </Badge>
                          )}
                        </div>
                      ))}
                      {scene.actors_data.length > 6 && (
                        <div className="text-xs text-accent-brown text-center py-2 font-medium">
                          ➕ {scene.actors_data.length - 6} more actors
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Enhanced Props Section */}
                {scene.props_data && scene.props_data.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-4 h-4 text-accent-secondary">📦</div>
                      <span className="text-sm font-semibold text-accent-secondary">🎪 Props ({scene.props_data.length})</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {scene.props_data.slice(0, 8).map((prop: any, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs justify-start bg-accent-secondary/20 text-accent-secondary border-accent-secondary/30 hover:bg-accent-secondary/30 transition-colors">
                          🎪 {typeof prop === 'string' ? prop : prop.name || prop}
                        </Badge>
                      ))}
                      {scene.props_data.length > 8 && (
                        <Badge variant="secondary" className="text-xs col-span-2 justify-center bg-accent-brown/20 text-accent-brown border-accent-brown/30">
                          ➕ {scene.props_data.length - 8} more props
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Location Details - Enhanced */}
                {scene.location_data && Object.keys(scene.location_data).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-medium text-amber-400">Location Details</span>
                    </div>
                    <div className="bg-gray-800/40 p-2 rounded space-y-1">
                      {scene.location_data.name && (
                        <div className="text-xs">
                          <span className="text-gray-400">Name:</span>
                          <span className="text-white ml-2">{scene.location_data.name}</span>
                        </div>
                      )}
                      {scene.location_data.type && (
                        <div className="text-xs">
                          <span className="text-gray-400">Type:</span>
                          <span className="text-white ml-2">{scene.location_data.type}</span>
                        </div>
                      )}
                      {scene.location_data.specific_details && (
                        <div className="text-xs">
                          <span className="text-gray-400">Details:</span>
                          <span className="text-white ml-2">{scene.location_data.specific_details}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Time & Weather Details */}
                {scene.time_data && Object.keys(scene.time_data).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">Time & Weather</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {scene.time_data.time_of_day && (
                        <div className="bg-gray-800/40 p-2 rounded">
                          <div className="text-gray-400">Time of Day</div>
                          <div className="text-white font-medium">{scene.time_data.time_of_day}</div>
                        </div>
                      )}
                      {scene.time_data.specific_time && (
                        <div className="bg-gray-800/40 p-2 rounded">
                          <div className="text-gray-400">Specific Time</div>
                          <div className="text-white font-medium">{scene.time_data.specific_time}</div>
                        </div>
                      )}
                      {scene.time_data.weather && (
                        <div className="bg-gray-800/40 p-2 rounded col-span-2">
                          <div className="text-gray-400">Weather</div>
                          <div className="text-white font-medium">{scene.time_data.weather}</div>
                        </div>
                      )}
                      {scene.time_data.season && (
                        <div className="bg-gray-800/40 p-2 rounded col-span-2">
                          <div className="text-gray-400">Season</div>
                          <div className="text-white font-medium">{scene.time_data.season}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Crowd Section - Enhanced */}
                {scene.crowd_data && (scene.crowd_data.people_needed || scene.crowd_data.crowd_type) && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 text-orange-400">👥</div>
                      <span className="text-sm font-medium text-orange-400">Crowd Requirements</span>
                    </div>
                    <div className="bg-gray-800/40 p-2 rounded">
                      {scene.crowd_data.people_needed && (
                        <div className="text-xs mb-1">
                          <span className="text-gray-400">People Needed:</span>
                          <span className="text-white ml-2 font-medium">{scene.crowd_data.people_needed}</span>
                        </div>
                      )}
                      {scene.crowd_data.crowd_type && (
                        <div className="text-xs">
                          <span className="text-gray-400">Type:</span>
                          <span className="text-white ml-2">{scene.crowd_data.crowd_type}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Production Details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-800/40 p-2 rounded">
                    <div className="text-gray-400">Duration</div>
                    <div className="text-white font-medium">
                      {scene.estimated_duration || scene.duration_minutes ? `${scene.duration_minutes} min` : 'TBD'}
                    </div>
                  </div>
                  <div className="bg-gray-800/40 p-2 rounded">
                    <div className="text-gray-400">Est. Cost</div>
                    <div className="text-white font-medium">
                      {scene.estimated_cost && scene.estimated_cost > 0 ? 
                        `₹${(scene.estimated_cost / 100000).toFixed(1)}L` : 
                        'TBD'
                      }
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={
                        scene.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        scene.status === 'shooting' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        scene.status === 'planned' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }
                    >
                      {(scene.status || 'unplanned').charAt(0).toUpperCase() + (scene.status || 'unplanned').slice(1)}
                    </Badge>
                    {scene.created_at && (
                      <span className="text-xs text-gray-500">
                        Added {new Date(scene.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-primary-bg transition-colors"
                    onClick={() => handleSceneEdit(scene)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    ✏️ Edit Details
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-accent-secondary hover:text-accent-primary hover:bg-accent-primary/20 transition-colors"
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    📅 Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <ScriptUploadModal 
        projectId={projectId}
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={loadScenes}
      />

      {selectedScene && (
        <SceneEditModal
          scene={{
            ...selectedScene,
            id: String(selectedScene.id),
            seq: selectedScene.seq || 0,
            slugline: selectedScene.scene_heading || selectedScene.slugline || '',
            interior: selectedScene.location_type === 'indoor' || selectedScene.interior || false,
            location: selectedScene.location_name || selectedScene.location || '',
            time_of_day: selectedScene.time_of_day || 'day',
            actors: selectedScene.actors || (selectedScene.actors_data?.map(a => typeof a === 'string' ? a : a.name) || []),
            props: selectedScene.props || (selectedScene.props_data?.map(p => typeof p === 'string' ? p : p.name) || []),
            crowd_estimate: selectedScene.crowd_data?.people_needed || 0,
            duration_minutes: 0,
            vfx: false,
            ai_confidence: 0.8,
            status: selectedScene.status || 'unplanned'
          }}
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedScene(null);
          }}
          onSave={loadScenes}
        />
      )}
    </div>
  );
}
