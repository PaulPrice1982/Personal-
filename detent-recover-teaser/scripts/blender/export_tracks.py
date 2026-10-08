# Blender → Remotion hole-track export.
#
# For the 3D artist. In the hero scene, parent an Empty named HOLE_<id> to each
# leak opening (ids match film.config.ts: HOLE_H-users, HOLE_R1, ...). Run this
# from Blender's Text Editor (or `blender scene.blend --background --python export_tracks.py -- S06`)
# for each shot camera. It writes tracks/<shot>.json with one normalised
# [x, y] per frame (0,0 = top-left of frame), which the film uses to lock every
# leak label to its hole. For native 9:16 / 1:1 cameras, export as S06@9x16 etc.
import bpy, json, os, sys
from bpy_extras.object_utils import world_to_camera_view

shot = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else bpy.context.scene.camera.name
scene = bpy.context.scene
cam = scene.camera
holes = [o for o in scene.objects if o.name.startswith('HOLE_')]
out = {h.name[5:]: [] for h in holes}

for frame in range(scene.frame_start, scene.frame_end + 1):
    scene.frame_set(frame)
    for h in holes:
        co = world_to_camera_view(scene, cam, h.matrix_world.translation)
        # Blender's y is bottom-up; the film's is top-down.
        out[h.name[5:]].append([round(co.x, 5), round(1 - co.y, 5)])

path = os.path.join(bpy.path.abspath('//'), '..', 'tracks', f'{shot}.json')
os.makedirs(os.path.dirname(path), exist_ok=True)
with open(path, 'w') as f:
    json.dump(out, f)
print(f'wrote {path} ({len(holes)} holes, {scene.frame_end - scene.frame_start + 1} frames)')
