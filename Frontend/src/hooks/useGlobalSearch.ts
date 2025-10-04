"use client"

import { useState, useEffect } from 'react';
import { Project, Scene, Character, Actor } from '@/lib/types';
import { apiClient } from '@/services/api/client';

export interface SearchResult {
  type: 'project' | 'scene' | 'character' | 'actor' | 'location' | 'prop';
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  projectTitle?: string;
  url: string;
}

export function useGlobalSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300); // Debounce search

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];
      const lowerQuery = searchTerm.toLowerCase();

      // Search projects
      const projects = await apiClient.getProjects();
      projects.forEach(project => {
        if (project.title.toLowerCase().includes(lowerQuery)) {
          searchResults.push({
            type: 'project',
            id: project.id,
            title: project.title,
            description: `${project.status} • ₹${(project.estimatedBudget / 10000000).toFixed(1)}Cr`,
            url: `/projects/${project.id}`
          });
        }
      });

      // Search scenes within projects
      for (const project of projects) {
        try {
          const scenes = await apiClient.getScenes(project.id);
          scenes.forEach(scene => {
            if (scene.title?.toLowerCase().includes(lowerQuery) ||
                scene.description?.toLowerCase().includes(lowerQuery) ||
                scene.location?.toLowerCase().includes(lowerQuery)) {
              searchResults.push({
                type: 'scene',
                id: scene.id,
                title: scene.title || `Scene ${scene.scene_number}`,
                description: `${project.title} • ${scene.location || 'Unknown location'}`,
                projectId: project.id,
                projectTitle: project.title,
                url: `/projects/${project.id}?tab=scenes`
              });
            }
          });
        } catch (error) {
          // Skip if scenes not available for this project
        }
      }

      // Search characters within projects
      for (const project of projects) {
        try {
          const characters = await apiClient.getCharacters(project.id);
          characters.forEach(character => {
            if (character.name.toLowerCase().includes(lowerQuery)) {
              searchResults.push({
                type: 'character',
                id: character.id,
                title: character.name,
                description: `${project.title} • ${character.actorName || 'No actor assigned'}`,
                projectId: project.id,
                projectTitle: project.title,
                url: `/projects/${project.id}?tab=characters`
              });
            }
          });
        } catch (error) {
          // Skip if characters not available for this project
        }
      }

      // Search actors in catalog
      for (const project of projects) {
        try {
          const actors = await apiClient.getCatalogItems(project.id, 'actor');
          actors.forEach(actor => {
            if (actor.name?.toLowerCase().includes(lowerQuery)) {
              searchResults.push({
                type: 'actor',
                id: actor.id,
                title: actor.name,
                description: `${project.title} • ₹${actor.daily_rate?.toLocaleString() || 'N/A'}/day`,
                projectId: project.id,
                projectTitle: project.title,
                url: `/projects/${project.id}?tab=catalog`
              });
            }
          });
        } catch (error) {
          // Skip if actors not available for this project
        }
      }

      setResults(searchResults.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading };
}