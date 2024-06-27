import { useEffect, useRef, useState } from "react"
import { hightlightsSlides } from "../constants"
import gsap from "gsap";
import { pauseImg, playImg, replayImg } from "../utils";
import { useGSAP } from "@gsap/react";

import { ScrollTrigger } from "gsap/all"
gsap.registerPlugin(ScrollTrigger);

const VideoCarousel = () => {

    const videoRef = useRef([]);
    const videoSpanRef = useRef([]);
    const videoDivRef = useRef([]);

    const [video, setVideo] = useState({
        isEnd: false,
        startplay: false,
        videoId: 0,
        isLastVideo: false,
        isPLaying: false,
    })

    const [loadedData, setLoadedData] = useState([])

    const { isEnd, isLastVideo, startplay, videoId, isPLaying } = video;

    useGSAP(() => {
        gsap.to('#slider', {
            transform: `translateX(${-100 * videoId}%)`,
            duration: 2,
            ease: 'power2.inOut'
        })

        gsap.to('#video', {
            scrollTrigger: {
                trigger: '#video',
                toggleActions: 'restart none none none',
            },
            onComplete: () => {
                setVideo((pre) => ({
                    ...pre,
                    startplay: true,
                    isPLaying: true,
                }))
            }
        })
    }, [isEnd, videoId])

    useEffect(() => {
        if (loadedData.length > 3) {
            if (!isPLaying) {
                videoRef.current[videoId].pause();
            } else {
                startplay && videoRef.current[videoId].play();
            }
        }
    }, [startplay, videoId, isPLaying, loadedData])

    const handleLoadedMetadata = (i, e) => setLoadedData((pre) => [...pre, e])

    useEffect(() => {
        let currentProgress = 0;
        let span = videoSpanRef.current;

        if (span[videoId]) {
            // animar progresso do video
            let anim = gsap.to(span[videoId], {
                onUpdate: () => {
                    const progress = Math.ceil(anim.progress() * 100)

                    if (progress != currentProgress) {
                        currentProgress = progress;
                        gsap.to(videoDivRef.current[videoId], {
                            width: window.innerWidth < 760
                                ? '10vw' : window.innerWidth < 1200
                                    ? '10vw' : '4vw'
                        })

                        gsap.to(span[videoId], {
                            width: `${currentProgress}%`,
                            backgroundColor: 'white'
                        })
                    }
                },
                onComplete: () => {
                    if (isPLaying) {
                        gsap.to(videoDivRef.current[videoId], {
                            width: '12px'
                        })

                        gsap.to(span[videoId], {
                            backgroundColor: '#afafaf'
                        })
                    }
                }
            })

            if (videoId === 0) {
                anim.restart();
            }

            const animUpdate = () => {
                anim.progress(videoRef.current[videoId].currentTime / hightlightsSlides[videoId].videoDuration)
            }

            if (isPLaying) {
                gsap.ticker.add(animUpdate)
            } else {
                gsap.ticker.remove(animUpdate)
            }
        }


    }, [videoId, startplay])

    const handleProcess = (type, i) => {
        switch (type) {
            case 'video-end':
                setVideo((pre) => ({ ...pre, isEnd: true, videoId: i + 1 }))
                break;
            case 'video-last':
                setVideo((pre) => ({ ...pre, isLastVideo: true }))
                break;

            case 'video-reset':
                setVideo((pre) => ({ ...pre, isLastVideo: false, videoId: 0 }))
                break;

            case 'play':
                setVideo((pre) => ({ ...pre, isPLaying: !pre.isPLaying }))
                break;

            case 'pause':
                setVideo((pre) => ({ ...pre, isPLaying: !pre.isPLaying }))
                break;
            default:
                return video
        }
    }

    return (
        <>
            <div className="flex items-center">
                {hightlightsSlides.map((list, i) => (
                    <div key={i} id="slider" className="sm:pr-20 pr-10">
                        <div className="video-carousel_container">
                            <div className="w-full h-full flex-center rounded-3xl overflow-hidden bg-black">
                                <video
                                    ref={(el) => (videoRef.current[i] = el)}
                                    onPlay={() => {
                                        setVideo((prevVideo) => ({
                                            ...prevVideo, isPLaying: true
                                        }))
                                    }}
                                    onLoadedMetadata={(e) => handleLoadedMetadata(i, e)}
                                    onEnded={() => (i !== 3
                                        ? handleProcess('video-end', i)
                                        : handleProcess('video-last')
                                    )}
                                    id="video"
                                    className={`${list.id === 2 && 'translate-x-44'} pointer-events-none`}
                                    playsInline={true}
                                    preload="auto"
                                    muted>
                                    <source src={list.video} type="video/mp4" />
                                </video>
                            </div>

                            <div className="absolute top-12 left-[5%] z-10">
                                {list.textLists.map((text) => (
                                    <p key={text} className="md:text-2xl text-xl font-medium">
                                        {text}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="relative flex-center mt-10">
                <div className="flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full">
                    {videoRef.current.map((_, i) => (
                        <span
                            key={i}
                            ref={(el) => (videoDivRef.current[i] = el)}
                            className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer"
                        >
                            <span
                                className="absolute w-full h-full rounded-full"
                                ref={(el) => (videoSpanRef.current[i] = el)}
                            />
                        </span>
                    ))}
                </div>
                <button className="control-btn">
                    <img
                        src={isLastVideo ? replayImg : !isPLaying ? playImg : pauseImg}
                        alt={isLastVideo ? "replay" : !isPLaying ? "play" : "pause"}
                        onClick={
                            isLastVideo ? () => handleProcess('video-reset')
                                : !isPLaying ? () => handleProcess('play')
                                    : () => handleProcess('pause')
                        }
                    />
                </button>

            </div>
        </>
    )
}

export default VideoCarousel
