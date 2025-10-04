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
        <div className="text-gray-400">Loading scenes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Scenes</h2>
          <p className="text-gray-400 text-sm mt-1">
            {scenes.length} scenes extracted from script
            {filteredScenes.length !== scenes.length && ` • ${filteredScenes.length} matching filters`}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            API: /api/scenes/projects/{projectId}/scenes
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={loadScenes}
            disabled={loading}
            className="text-gray-300"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => setUploadModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Script
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      {scenes.length > 0 && (
        <Card className="bg-gray-900/30 border-gray-700">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search scenes, locations, actors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="flex gap-2">
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="indoor">Indoor</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-28 bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Times</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scenes Overview */}
      {scenes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">{filteredScenes.length}</div>
              <div className="text-sm text-gray-400">
                {filteredScenes.length === scenes.length ? 'Total Scenes' : 'Filtered Scenes'}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">
                {filteredScenes.filter(s => s.location_type === 'indoor' || s.interior).length}
              </div>
              <div className="text-sm text-gray-400">Interior</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">
                {filteredScenes.filter(s => s.location_type === 'outdoor' || (!s.interior && s.interior !== undefined)).length}
              </div>
              <div className="text-sm text-gray-400">Exterior</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-600/10 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">
                {filteredScenes.filter(s => s.technical_notes || (s.actors_data && s.actors_data.some((a: any) => a.vfx))).length}
              </div>
              <div className="text-sm text-gray-400">Special Scenes</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {scenes.length === 0 && !loading && (
        <Card className="bg-gray-900/30 border-dashed border-gray-600">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Scenes Yet</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Upload your film script PDF and our AI will automatically extract scenes,
              characters, props, locations, and more.
            </p>
            <Button 
              onClick={() => setUploadModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Script PDF
            </Button>
          </CardContent>
        </Card>
      )}

      {/* No Results State */}
      {scenes.length > 0 && filteredScenes.length === 0 && !loading && (
        <Card className="bg-gray-900/30 border-gray-600">
          <CardContent className="p-8 text-center">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Scenes Match Your Filters</h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('all');
                setTimeFilter('all');
              }}
            >
              Clear All Filters
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
              className="bg-gray-900/50 border-gray-700 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-blue-400 border-blue-500/50 font-mono text-xs">
                        {scene.scene_number || `Scene ${scene.seq || scene.id}`}
                      </Badge>
                      <Badge className={getTimeOfDayColor(scene.time_of_day || 'day')}>
                        {(scene.time_of_day || 'DAY').toUpperCase()}
                      </Badge>
                      {scene.location_type && (
                        <Badge variant="secondary" className="text-xs">
                          {scene.location_type.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-white text-base font-semibold leading-tight">
                      {scene.scene_heading || 
                       `${(scene.location_type === 'indoor' || scene.interior) ? 'INT.' : 'EXT.'} ${scene.location_name || scene.location || 'Unknown Location'}`}
                    </CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-400 hover:text-blue-400 p-1"
                    onClick={() => handleSceneEdit(scene)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Location Details */}
                {scene.location_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>{scene.location_name}</span>
                    {scene.location_data?.specific_details && (
                      <span className="text-gray-500">• {scene.location_data.specific_details}</span>
                    )}
                  </div>
                )}

                {/* Time & Duration */}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{scene.estimated_duration || 'Unknown duration'}</span>
                  </div>
                  {scene.time_data?.specific_time && (
                    <span>{scene.time_data.specific_time}</span>
                  )}
                  {scene.time_data?.weather && (
                    <span>• {scene.time_data.weather}</span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Scene Description/Notes */}
                {(scene.technical_notes || scene.notes) && (
                  <div className="bg-gray-800/30 p-3 rounded border-l-2 border-blue-500">
                    <div className="text-xs font-medium text-blue-400 mb-1">Scene Notes</div>
                    <div className="text-xs text-gray-300 leading-relaxed">
                      {scene.technical_notes || scene.notes}
                    </div>
                  </div>
                )}

                {/* Cast Section - Enhanced */}
                {scene.actors_data && scene.actors_data.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-400">Cast ({scene.actors_data.length})</span>
                    </div>
                    <div className="space-y-2">
                      {scene.actors_data.slice(0, 6).map((actor: any, idx: number) => (
                        <div key={idx} className="flex items-start justify-between p-2 bg-gray-800/40 rounded">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">
                              {typeof actor === 'string' ? actor : actor.name || 'Unknown Actor'}
                            </div>
                            {typeof actor === 'object' && actor.description && (
                              <div className="text-xs text-gray-400 mt-1">
                                {actor.description}
                              </div>
                            )}
                          </div>
                          {typeof actor === 'object' && actor.role && (
                            <Badge variant="outline" className="text-xs ml-2">
                              {actor.role}
                            </Badge>
                          )}
                        </div>
                      ))}
                      {scene.actors_data.length > 6 && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          +{scene.actors_data.length - 6} more actors
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Props Section - Enhanced */}
                {scene.props_data && scene.props_data.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 text-green-400">📦</div>
                      <span className="text-sm font-medium text-green-400">Props ({scene.props_data.length})</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {scene.props_data.slice(0, 8).map((prop: any, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs justify-start">
                          {typeof prop === 'string' ? prop : prop.name || prop}
                        </Badge>
                      ))}
                      {scene.props_data.length > 8 && (
                        <Badge variant="secondary" className="text-xs col-span-2 justify-center">
                          +{scene.props_data.length - 8} more props
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

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs"
                    onClick={() => handleSceneEdit(scene)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit Details
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    Schedule
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
