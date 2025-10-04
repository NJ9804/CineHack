#!/usr/bin/env python3
"""
Script to extract main characters from script analysis JSON files.
Creates a separate JSON file with only the main role characters.
"""

import json
import sys
from pathlib import Path
from typing import List, Dict, Set

def extract_main_characters_from_file(json_file_path: str) -> Dict:
    """
    Extract main characters from a script analysis JSON file.
    Now extracts both character names and potential actor names.
    
    Args:
        json_file_path: Path to the script analysis JSON file
    
    Returns:
        Dictionary containing main characters data with actor/character separation
    """
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        main_characters = {}
        
        # Extract scenes data
        scenes = data.get('scenes', [])
        
        for scene in scenes:
            scene_number = scene.get('scene_number', 'Unknown')
            actors = scene.get('actors', [])
            
            for actor in actors:
                name = actor.get('name', '').strip()
                role = actor.get('role', '').lower()
                description = actor.get('description', '')
                
                # Only extract characters with "main" role
                if role == 'main' and name:
                    # Try to separate actor name from character name
                    character_name = name
                    actor_name = None
                    
                    # Look for patterns like "Actor Name (Character)" or "Character (Actor Name)"
                    # Common patterns in scripts
                    if '(' in name and ')' in name:
                        # Extract content within parentheses
                        import re
                        match = re.search(r'(.+?)\s*\((.+?)\)', name)
                        if match:
                            part1, part2 = match.groups()
                            # Assume the longer/more descriptive part is character, shorter is actor
                            if len(part1) > len(part2) or any(word in part2.lower() for word in ['actor', 'voice', 'played']):
                                character_name = part1.strip()
                                actor_name = part2.strip()
                            else:
                                character_name = part2.strip()
                                actor_name = part1.strip()
                    
                    # Look for patterns in description that might mention real actor names
                    if description and not actor_name:
                        # Common phrases that indicate actor names
                        actor_indicators = ['played by', 'portrayed by', 'actor', 'voice of', 'cast as']
                        desc_lower = description.lower()
                        for indicator in actor_indicators:
                            if indicator in desc_lower:
                                # Try to extract actor name after the indicator
                                import re
                                pattern = rf'{indicator}\s+([A-Za-z\s]+?)(?:[,.]|$)'
                                match = re.search(pattern, desc_lower)
                                if match:
                                    actor_name = match.group(1).strip().title()
                                    break
                    
                    if character_name not in main_characters:
                        main_characters[character_name] = {
                            'character_name': character_name,
                            'actor_name': actor_name,  # Could be None if not found
                            'role': 'main',
                            'first_appearance_scene': scene_number,
                            'total_scenes': 0,
                            'scenes': [],
                            'descriptions': []
                        }
                    
                    # Update character data
                    main_characters[character_name]['total_scenes'] += 1
                    main_characters[character_name]['scenes'].append(scene_number)
                    
                    if description and description not in main_characters[character_name]['descriptions']:
                        main_characters[character_name]['descriptions'].append(description)
                    
                    # Update actor name if we found a better one
                    if actor_name and not main_characters[character_name]['actor_name']:
                        main_characters[character_name]['actor_name'] = actor_name
        
        # Create the output structure
        result = {
            'source_file': Path(json_file_path).name,
            'extraction_summary': {
                'total_main_characters': len(main_characters),
                'characters_found': list(main_characters.keys()),
                'characters_with_actors': [char for char, data in main_characters.items() if data['actor_name']],
                'characters_without_actors': [char for char, data in main_characters.items() if not data['actor_name']]
            },
            'main_characters': list(main_characters.values())
        }
        
        return result
        
    except FileNotFoundError:
        print(f"Error: File not found: {json_file_path}")
        return {}
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in file {json_file_path}: {e}")
        return {}
    except Exception as e:
        print(f"Error processing file {json_file_path}: {e}")
        return {}

def main():
    """Main function to extract main characters from script analysis files."""
    
    # Define input and output files
    backend_dir = Path(__file__).parent
    
    # Get all script analysis JSON files
    json_files = list(backend_dir.glob("script_analysis_*.json"))
    
    if not json_files:
        print("No script analysis JSON files found in the Backend directory.")
        return
    
    print(f"Found {len(json_files)} script analysis file(s):")
    for i, file in enumerate(json_files, 1):
        print(f"  {i}. {file.name}")
    
    # Combined result structure
    combined_result = {
        "extraction_info": {
            "total_files_processed": len(json_files),
            "source_files": [file.name for file in json_files],
            "extraction_date": "2025-10-04"
        },
        "main_characters": [],
        "summary": {
            "total_unique_characters": 0,
            "character_names": []
        }
    }
    
    all_characters = {}  # To track unique characters across files
    
    # Process each file
    for json_file in json_files:
        print(f"\nProcessing: {json_file.name}")
        
        # Extract main characters
        file_data = extract_main_characters_from_file(str(json_file))
        
        if not file_data:
            print(f"  ❌ Failed to extract data from {json_file.name}")
            continue
        
        print(f"  ✅ Found {file_data['extraction_summary']['total_main_characters']} main characters")
        print(f"  👤 Characters: {', '.join(file_data['extraction_summary']['characters_found'])}")
        
        # Add characters to combined result
        for char in file_data['main_characters']:
            char_key = f"{char['character_name']}_{char.get('actor_name', 'unknown')}"
            char['source_file'] = json_file.name  # Add source file info
            
            # Check if character already exists (merge if found in multiple files)
            if char_key in all_characters:
                # Merge scene data if character appears in multiple files
                existing_char = all_characters[char_key]
                existing_char['total_scenes'] += char['total_scenes']
                existing_char['scenes'].extend(char['scenes'])
                existing_char['descriptions'].extend(char['descriptions'])
                existing_char['source_file'] += f", {json_file.name}"
            else:
                all_characters[char_key] = char
    
    # Update combined result
    combined_result['main_characters'] = list(all_characters.values())
    combined_result['summary']['total_unique_characters'] = len(all_characters)
    combined_result['summary']['character_names'] = [char['character_name'] for char in all_characters.values()]
    
    # Print combined results to terminal
    print(f"\n🎬 COMBINED EXTRACTION RESULTS")
    print("="*60)
    print(f"📁 Files processed: {combined_result['extraction_info']['total_files_processed']}")
    print(f"👤 Total unique main characters: {combined_result['summary']['total_unique_characters']}")
    print(f"� Character names: {', '.join(combined_result['summary']['character_names'])}")
    
    print("\n📋 DETAILED CHARACTER INFO:")
    print("="*60)
    
    for i, char in enumerate(combined_result['main_characters'], 1):
        print(f"{i}. Character: {char['character_name']}")
        if char['actor_name']:
            print(f"   • Actor: {char['actor_name']}")
        else:
            print(f"   • Actor: Not specified")
        print(f"   • Role: {char['role']}")
        print(f"   • Source: {char['source_file']}")
        print(f"   • First appears in scene: {char['first_appearance_scene']}")
        print(f"   • Total scenes: {char['total_scenes']}")
        print(f"   • Scenes: {', '.join(map(str, char['scenes'][:10]))}{'...' if len(char['scenes']) > 10 else ''}")
        if char['descriptions']:
            print(f"   • Description: {char['descriptions'][0][:100]}{'...' if len(char['descriptions'][0]) > 100 else ''}")
        print()
    
    # Save single combined file
    output_file = backend_dir / "main_characters_combined.json"
    
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(combined_result, f, indent=2, ensure_ascii=False)
        
        print(f"📁 Saved combined results to: {output_file.name}")
        
        # Final summary
        print("\n🎬 CHARACTER EXTRACTION COMPLETE!")
        print(f"Total characters found: {len(combined_result['main_characters'])}")
        print(f"✅ Characters with actor names: {sum(1 for char in combined_result['main_characters'] if char['actor_name'])}")
        print(f"❓ Characters without actor names: {sum(1 for char in combined_result['main_characters'] if not char['actor_name'])}")
        print(f"📝 Files processed: {len(combined_result['source_files'])}")
        print(f"💾 Output saved to: {output_file.name}")
        print("\n🎭 Characters ready for mapping in frontend!")
        
    except Exception as e:
        print(f"❌ Failed to save combined file: {e}")

if __name__ == "__main__":
    main()