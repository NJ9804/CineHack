"""
Advanced AI-Powered Scheduling Service
Intelligently schedules scenes based on multiple factors:
- Actor availability and payment types
- Weather predictions
- Location clustering
- Budget optimization
- Equipment availability
- Crew allocation
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from collections import defaultdict
import json

class SchedulingEngine:
    """Core scheduling engine with multiple optimization strategies"""
    
    def __init__(self, scenes: List, actors: List, project_config: Dict, global_costs: List = None):
        self.scenes = scenes
        self.actors = actors
        self.global_costs = global_costs or []
        self.config = project_config
        self.schedule = {}
        self.conflicts = []
        
    def calculate_scene_priority(self, scene) -> float:
        """Calculate priority score for a scene (higher = schedule earlier)"""
        priority = 0.0
        
        # Factor 1: Indoor scenes get lower priority in good weather
        if scene.location_type == 'indoor':
            priority += 2.0
        else:
            priority += 5.0  # Outdoor scenes need good weather
            
        # Factor 2: Number of actors (more actors = harder to schedule)
        num_actors = len(scene.actors_data) if scene.actors_data else 0
        priority += num_actors * 1.5
        
        # Factor 3: Scene complexity
        if scene.technical_notes:
            complexity_score = len(scene.technical_notes) / 100
            priority += complexity_score
            
        # Factor 4: Time of day requirements
        if scene.time_of_day in ['dawn', 'dusk', 'golden_hour']:
            priority += 3.0  # Special timing = higher priority
            
        return priority
    
    def cluster_scenes_by_location(self) -> Dict[str, List]:
        """Group scenes by location to minimize travel"""
        location_clusters = defaultdict(list)
        
        for scene in self.scenes:
            location_key = scene.location_name or 'Unknown'
            location_clusters[location_key].append(scene)
            
        return dict(location_clusters)
    
    def get_actor_payment_type(self, actor_name: str) -> str:
        """Get actor's payment type from global_costs (daily/weekly/monthly)"""
        # Check global costs for this actor
        for cost in self.global_costs:
            if (cost.category == 'actor' and 
                cost.name.lower() == actor_name.lower()):
                return cost.billing_cycle  # daily/weekly/monthly
        
        # Default to daily if not found
        return 'daily'
    
    def calculate_actor_cost(self, actor_name: str, days: int) -> float:
        """Calculate cost for an actor based on billing cycle from global_costs"""
        # Find actor in global costs
        for cost in self.global_costs:
            if (cost.category == 'actor' and 
                cost.name.lower() == actor_name.lower()):
                
                daily_rate = cost.cost or 0
                billing_cycle = cost.billing_cycle
                
                if billing_cycle == 'daily':
                    return daily_rate * days
                elif billing_cycle == 'weekly':
                    weeks = (days + 6) // 7  # Round up to nearest week
                    return daily_rate * weeks * 0.85  # 15% discount for weekly
                elif billing_cycle == 'monthly':
                    months = (days + 29) // 30  # Round up to nearest month
                    return daily_rate * months * 0.7  # 30% discount for monthly
                    
        return 0.0
    
    def optimize_for_actor_costs(self, location_clusters: Dict) -> Dict[str, List]:
        """Optimize schedule to minimize actor costs based on billing cycles from global_costs"""
        optimized = {}
        
        for location, scenes in location_clusters.items():
            # Group scenes by actors
            actor_scenes = defaultdict(list)
            
            for scene in scenes:
                if scene.actors_data:
                    for actor_info in scene.actors_data:
                        actor_name = actor_info.get('name', '')
                        if actor_name:
                            actor_scenes[actor_name].append(scene)
            
            # For actors with weekly/monthly billing, schedule their scenes consecutively
            for actor_name, actor_scene_list in actor_scenes.items():
                billing_cycle = self.get_actor_payment_type(actor_name)
                
                if billing_cycle in ['weekly', 'monthly']:
                    # Prioritize these scenes to be scheduled together
                    for scene in actor_scene_list:
                        if hasattr(scene, '_priority_boost'):
                            scene._priority_boost += 2.0
                        else:
                            scene._priority_boost = 2.0
            
            optimized[location] = sorted(
                scenes,
                key=lambda s: self.calculate_scene_priority(s) + getattr(s, '_priority_boost', 0),
                reverse=True
            )
        
        return optimized
    
    def check_weather_suitability(self, date: datetime, scene) -> Tuple[bool, str]:
        """Check if weather is suitable for the scene (placeholder for API integration)"""
        # This will be replaced with actual weather API call
        # For now, simulate weather prediction
        
        if scene.location_type == 'indoor':
            return True, "Indoor scene - weather independent"
        
        # Simulate weather check (will integrate real API)
        day_of_year = date.timetuple().tm_yday
        
        # Simple heuristic: avoid rainy season
        if 150 <= day_of_year <= 250:  # Roughly Jun-Sep (rainy season in many places)
            return False, "Rainy season - not ideal for outdoor shoot"
        
        return True, "Weather suitable"
    
    def schedule_scenes(
        self,
        start_date: datetime,
        end_date: datetime,
        optimization_mode: str = 'balanced'
    ) -> Dict:
        """
        Main scheduling algorithm
        
        Args:
            start_date: Project start date
            end_date: Project end date
            optimization_mode: 'cost', 'speed', 'balanced', 'quality'
        """
        
        # Step 1: Cluster scenes by location
        location_clusters = self.cluster_scenes_by_location()
        
        # Step 2: Optimize based on mode
        if optimization_mode in ['cost', 'balanced']:
            location_clusters = self.optimize_for_actor_costs(location_clusters)
        
        # Step 3: Sort locations by number of scenes (shoot biggest locations first)
        sorted_locations = sorted(
            location_clusters.items(),
            key=lambda x: len(x[1]),
            reverse=True
        )
        
        # Step 4: Assign dates to scenes
        current_date = start_date
        schedule_result = []
        daily_capacity = 5  # Default: 5 scenes per day
        
        if optimization_mode == 'speed':
            daily_capacity = 7  # More scenes per day for faster completion
        elif optimization_mode == 'quality':
            daily_capacity = 3  # Fewer scenes per day for better quality
        
        for location, scenes in sorted_locations:
            for i, scene in enumerate(scenes):
                # Check if we exceeded end date
                if current_date > end_date:
                    self.conflicts.append({
                        'type': 'timeline_exceeded',
                        'message': f'Cannot fit scene {scene.id} within project timeline',
                        'scene_id': scene.id
                    })
                    continue
                
                # Check weather suitability
                weather_ok, weather_msg = self.check_weather_suitability(current_date, scene)
                
                if not weather_ok and scene.location_type == 'outdoor':
                    # Try next available good weather day
                    attempts = 0
                    while attempts < 30:  # Try for 30 days
                        current_date += timedelta(days=1)
                        weather_ok, weather_msg = self.check_weather_suitability(current_date, scene)
                        if weather_ok:
                            break
                        attempts += 1
                
                # Assign scene to date
                schedule_result.append({
                    'scene_id': scene.id,
                    'scene_number': scene.scene_number,
                    'location': location,
                    'scheduled_date': current_date,
                    'weather_note': weather_msg,
                    'estimated_duration': scene.estimated_duration or '4 hours'
                })
                
                # Move to next day after reaching daily capacity
                if (i + 1) % daily_capacity == 0:
                    current_date += timedelta(days=1)
                    
                    # Skip weekends if configured
                    if self.config.get('skip_weekends', False):
                        while current_date.weekday() >= 5:  # Saturday = 5, Sunday = 6
                            current_date += timedelta(days=1)
        
        return {
            'schedule': schedule_result,
            'total_days': (current_date - start_date).days,
            'conflicts': self.conflicts,
            'completion_date': current_date
        }
    
    def detect_conflicts(self, schedule: List[Dict]) -> List[Dict]:
        """Detect scheduling conflicts"""
        conflicts = []
        
        # Group by date
        scenes_by_date = defaultdict(list)
        for item in schedule:
            date_key = item['scheduled_date'].date()
            scenes_by_date[date_key].append(item)
        
        # Check for conflicts each day
        for date, day_scenes in scenes_by_date.items():
            # Check for same actor in multiple scenes
            actor_scenes = defaultdict(list)
            
            for item in day_scenes:
                scene = next((s for s in self.scenes if s.id == item['scene_id']), None)
                if scene and scene.actors_data:
                    for actor_info in scene.actors_data:
                        actor_name = actor_info.get('name', '')
                        if actor_name:
                            actor_scenes[actor_name].append(item['scene_id'])
            
            for actor, scene_ids in actor_scenes.items():
                if len(scene_ids) > 3:
                    conflicts.append({
                        'type': 'actor_overload',
                        'severity': 'medium',
                        'date': date,
                        'actor': actor,
                        'scene_count': len(scene_ids),
                        'message': f'{actor} scheduled for {len(scene_ids)} scenes on {date}'
                    })
        
        return conflicts
    
    def reschedule_scene(
        self,
        scene_id: int,
        new_date: datetime,
        current_schedule: List[Dict]
    ) -> Dict:
        """Reschedule a single scene and cascade changes if needed"""
        
        # Find the scene in schedule
        scene_index = next(
            (i for i, item in enumerate(current_schedule) if item['scene_id'] == scene_id),
            None
        )
        
        if scene_index is None:
            return {'success': False, 'message': 'Scene not found in schedule'}
        
        old_date = current_schedule[scene_index]['scheduled_date']
        current_schedule[scene_index]['scheduled_date'] = new_date
        
        # Check if auto-cascade is enabled
        if self.config.get('auto_cascade', True):
            # Reschedule dependent scenes
            affected_scenes = self._get_dependent_scenes(scene_id)
            
            for affected_scene_id in affected_scenes:
                affected_index = next(
                    (i for i, item in enumerate(current_schedule) if item['scene_id'] == affected_scene_id),
                    None
                )
                
                if affected_index and current_schedule[affected_index]['scheduled_date'] < new_date:
                    # Move dependent scene to after the rescheduled scene
                    current_schedule[affected_index]['scheduled_date'] = new_date + timedelta(days=1)
        
        # Redetect conflicts
        new_conflicts = self.detect_conflicts(current_schedule)
        
        return {
            'success': True,
            'message': f'Scene {scene_id} rescheduled from {old_date} to {new_date}',
            'updated_schedule': current_schedule,
            'new_conflicts': new_conflicts,
            'affected_scenes': affected_scenes if self.config.get('auto_cascade', True) else []
        }
    
    def _get_dependent_scenes(self, scene_id: int) -> List[int]:
        """Get scenes that depend on this scene (e.g., story continuity)"""
        # This could be enhanced with actual dependency tracking
        # For now, return scenes with higher scene numbers in same location
        
        scene = next((s for s in self.scenes if s.id == scene_id), None)
        if not scene:
            return []
        
        dependent = []
        scene_num = int(scene.scene_number) if scene.scene_number and scene.scene_number.isdigit() else 0
        
        for other_scene in self.scenes:
            other_num = int(other_scene.scene_number) if other_scene.scene_number and other_scene.scene_number.isdigit() else 0
            
            if (other_scene.location_name == scene.location_name and 
                other_num > scene_num and 
                other_scene.id != scene_id):
                dependent.append(other_scene.id)
        
        return dependent[:3]  # Limit to 3 most immediate dependent scenes


class WeatherService:
    """Integration with weather API for predictions"""
    
    @staticmethod
    async def get_weather_forecast(location: str, date: datetime) -> Dict:
        """
        Get weather forecast for a location and date
        This is a placeholder - integrate with OpenWeatherMap, WeatherAPI, etc.
        """
        
        # TODO: Integrate real weather API
        # Example with OpenWeatherMap:
        # api_key = os.getenv('WEATHER_API_KEY')
        # url = f'https://api.openweathermap.org/data/2.5/forecast?q={location}&appid={api_key}'
        
        # For now, return mock data
        return {
            'temperature': 25,
            'conditions': 'partly_cloudy',
            'precipitation_chance': 20,
            'suitable_for_outdoor': True,
            'wind_speed': 10,
            'humidity': 65
        }
    
    @staticmethod
    def is_suitable_for_scene(weather: Dict, scene) -> Tuple[bool, str]:
        """Determine if weather is suitable for the scene"""
        
        if scene.location_type == 'indoor':
            return True, "Indoor scene"
        
        # Check precipitation
        if weather['precipitation_chance'] > 60:
            return False, "High chance of rain"
        
        # Check wind for outdoor scenes
        if weather['wind_speed'] > 30:
            return False, "Strong winds"
        
        # Check if scene requires specific weather
        if scene.time_data:
            required_weather = scene.time_data.get('weather', 'any')
            if required_weather != 'any' and required_weather != weather['conditions']:
                return False, f"Scene requires {required_weather} but {weather['conditions']} predicted"
        
        return True, "Weather suitable"
