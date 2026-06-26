import { useCallback, useEffect, useRef } from "react";

const TRACKS = [
  "https://recursos.acelingua.com/ost/1.mp3",
  "https://recursos.acelingua.com/ost/2.mp3",
  "https://recursos.acelingua.com/ost/3.mp3",
];
const MUSIC_VOLUME = 0.35;

// One <audio> element reused for the whole game session. A random track is picked
// and (re)started each time the player begins a node attempt, then loops until the
// run ends -- this is what gives each "partida" its own random background track.
export const useBackgroundMusic = (muted: boolean) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Read via ref (not the `muted` param) inside playRandomTrack, which is memoized
  // once on mount -- otherwise it would always see the `muted` value from that render.
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.loop = true;
      audio.preload = "auto";
      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  // Must run synchronously inside the click handler that starts a node, before any
  // `await` -- browsers only allow audio.play() to succeed within a user gesture.
  const playRandomTrack = useCallback(() => {
    const audio = getAudio();
    audio.src = TRACKS[Math.floor(Math.random() * TRACKS.length)];
    audio.volume = mutedRef.current ? 0 : MUSIC_VOLUME;
    audio.currentTime = 0;
    audio.play().catch(() => {
      /* browser blocked autoplay; nothing else to do */
    });
  }, [getAudio]);

  const stop = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : MUSIC_VOLUME;
  }, [muted]);

  useEffect(() => stop, [stop]);

  return { playRandomTrack, stop };
};
