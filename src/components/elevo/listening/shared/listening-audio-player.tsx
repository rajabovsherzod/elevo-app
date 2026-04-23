"use client"

import { useRef, memo } from "react"
import { Plyr } from "plyr-react"
import "plyr-react/plyr.css"
import "./listening-audio-player.css"

interface Props {
  src: string
}

export const ListeningAudioPlayer = memo(function ListeningAudioPlayer({ src }: Props) {
  const playerRef = useRef<any>(null)

  const plyrOptions = {
    controls: [
      'play-large',
      'play',
      'progress',
      'current-time',
      'duration',
      'mute',
      'volume',
    ],
    tooltips: { controls: true, seek: true },
    speed: { selected: 1, options: [1] },
    keyboard: { focused: true, global: false },
  }

  return (
    <div className="w-full" key="audio-player-stable">
      <Plyr
        source={{
          type: 'audio',
          sources: [{ src, type: 'audio/mpeg' }],
        }}
        options={plyrOptions}
        ref={playerRef}
      />
    </div>
  )
})
