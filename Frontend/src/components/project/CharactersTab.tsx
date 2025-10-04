"use client"

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { User, Users, Calendar, DollarSign, Film } from 'lucide-react';
import { Character, Actor } from '@/lib/types';
import { mockActors } from '@/services/mock/data';
import { useButtonActions } from '@/hooks/useButtonActions';

interface CharactersTabProps {
  projectId: string;
  characters: Character[];
}

export default function CharactersTab({ projectId, characters }: CharactersTabProps) {
  const actors = mockActors;
  const actions = useButtonActions();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const castCharacters = characters.filter(c => c.actorId);
  const uncastCharacters = characters.filter(c => !c.actorId);

  return (
    <div className="space-y-6">
      {/* Characters Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{characters.length}</div>
            <div className="text-sm text-gray-400">Total Characters</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{castCharacters.length}</div>
            <div className="text-sm text-gray-400">Cast Assigned</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-600/10 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{uncastCharacters.length}</div>
            <div className="text-sm text-gray-400">Needs Casting</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">
              {castCharacters.length > 0 
                ? `₹${(castCharacters.reduce((sum, char) => {
                    const actor = actors.find(a => a.id === char.actorId);
                    return sum + (actor?.salary || 0);
                  }, 0) / 10000000).toFixed(1)}Cr`
                : '₹0'}
            </div>
            <div className="text-sm text-gray-400">Total Cast Cost</div>
          </CardContent>
        </Card>
      </div>

      {/* Character Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cast Characters */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-400" />
              Cast Characters ({castCharacters.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {castCharacters.map((character) => {
                const actor = actors.find(a => a.id === character.actorId);
                
                return (
                  <div key={character.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{character.name}</h4>
                          <p className="text-sm text-green-400">{actor?.name || 'Unknown Actor'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <div className="text-sm font-medium text-white">
                        {actor ? formatCurrency(actor.salary) : 'No salary data'}
                      </div>
                      <div className="flex items-center text-xs text-gray-400">
                        <Film className="w-3 h-3 mr-1" />
                        {character.scenes.length} scenes
                      </div>
                    </div>
                    
                    <div className="ml-4 space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => actions.handleEditCharacter(character.id, projectId)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-400 hover:text-red-300"
                        onClick={() => actions.handleRemoveCharacter(character.id, projectId)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
              
              {castCharacters.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No characters have been cast yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Uncast Characters */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <User className="w-5 h-5 mr-2 text-yellow-400" />
              Needs Casting ({uncastCharacters.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uncastCharacters.map((character) => (
                <div key={character.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{character.name}</h4>
                        <p className="text-sm text-gray-400">Not cast</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center text-xs text-gray-400">
                      <Film className="w-3 h-3 mr-1" />
                      {character.scenes.length} scenes
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <Button variant="cinematic" size="sm">
                      Cast Actor
                    </Button>
                  </div>
                </div>
              ))}
              
              {uncastCharacters.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <div className="w-12 h-12 mx-auto mb-2 opacity-50 flex items-center justify-center">
                    ✓
                  </div>
                  <p>All characters have been cast!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Actors */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-amber-400" />
            Available Actors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {actors.map((actor) => {
              const isAssigned = characters.some(c => c.actorId === actor.id);
              
              return (
                <div key={actor.id} className={`p-4 rounded-lg border transition-colors ${
                  isAssigned 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-gray-800/50 border-gray-700 hover:border-amber-500/50'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isAssigned 
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                        : 'bg-gradient-to-r from-amber-400 to-yellow-500'
                    }`}>
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{actor.name}</h4>
                      <p className="text-sm text-gray-400">{formatCurrency(actor.salary)}</p>
                    </div>
                    {isAssigned && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Assigned
                      </Badge>
                    )}
                  </div>
                  
                  {!isAssigned && (
                    <div className="mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => actions.handleAssignActor(actor.id, projectId)}
                      >
                        Assign to Character
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Character Management Actions */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Character Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="cinematic"
              onClick={() => actions.handleAddActor(projectId)}
            >
              Add New Character
            </Button>
            <Button 
              variant="outline"
              onClick={() => actions.handleExportProject(projectId)}
            >
              Import Characters from Script
            </Button>
            <Button 
              variant="outline"
              onClick={() => actions.handleAnalytics()}
            >
              Auto-Suggest Casting
            </Button>
            <Button 
              variant="outline"
              onClick={() => actions.handleExportProject(projectId)}
            >
              Export Cast List
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}