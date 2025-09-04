# Black Hole Video Background Setup

## Quick Setup

To add your black hole video background:

1. **Download a black hole video** from one of these sources:
   - [Pixabay Black Hole Videos](https://pixabay.com/videos/search/black%20hole/)
   - [Pexels Space Videos](https://www.pexels.com/search/videos/black%20hole/)
   - [Unsplash Videos](https://unsplash.com/s/videos/black-hole)

2. **Rename and place the video**:
   - Rename your video file to `blackhole-video.mp4`
   - Place it in the `public/` folder of your project
   - For better compatibility, also provide a WebM version as `blackhole-video.webm`

3. **Recommended video specifications**:
   - Format: MP4 (H.264) or WebM
   - Resolution: 1920x1080 or higher
   - Duration: 10-30 seconds (it will loop)
   - File size: Under 10MB for better loading

## Alternative Options

If you don't have a video file, the component will automatically show:
- **Animated CSS Black Hole**: A beautiful rotating accretion disk with event horizon
- **Starfield Background**: Animated stars and cosmic effects
- **Gravitational Lensing Effects**: Pulsing rings simulating space-time distortion

## File Structure
```
public/
├── blackhole-video.mp4     ← Your main video file
├── blackhole-video.webm    ← Optional WebM version
└── ...other files
```

## Testing
Run `npm run dev:frontend` to see your video background in action!

## Troubleshooting

- **Video not loading**: Check browser console for errors
- **Large file size**: Compress your video using tools like HandBrake
- **Format issues**: Convert to MP4 using VLC or online converters
- **Performance issues**: Try a smaller resolution or shorter duration

The fallback CSS animation will show if the video fails to load, so your site will always look great!
