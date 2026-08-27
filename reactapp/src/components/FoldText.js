import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './FoldText.css';

gsap.registerPlugin(ScrollTrigger);

const FoldText = ({
    text = '',
    splitBy = 'char',
    hinge = 'top',
    trigger = 'mount',
    duration = 0.65,
    stagger = 0.045,
    ease = 'power3.out',
    perspective = 700,
    creaseShading = 0.7,
    fontSize = 'clamp(3rem, 8vw, 7rem)',
    fontWeight = 650,
    color = '#f7f2e8',
    className = '',
}) => {
    const containerRef = useRef(null);

    /*
     * Split text into the requested units.
     */
    const getUnits = () => {
        if (splitBy === 'word') {
            return text.split(/(\s+)/);
        }

        if (splitBy === 'line') {
            return text.split('\n');
        }

        return Array.from(text);
    };

    const units = getUnits();

    useEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        const panels = container.querySelectorAll('.fold-text-panel');

        if (!panels.length) {
            return;
        }

        const ctx = gsap.context(() => {

            /*
             * Initial folded state
             */
            gsap.set(panels, {
                rotateX: hinge === 'bottom' ? -90 : 90,
                transformOrigin:
                    hinge === 'bottom'
                        ? 'center bottom'
                        : 'center top',
                transformPerspective: perspective,
                opacity: 0,
            });


            const animateIn = () => {
                gsap.to(panels, {
                    rotateX: 0,
                    opacity: 1,
                    duration,
                    stagger,
                    ease,
                    overwrite: true,
                });
            };


            /*
             * Mount animation
             */
            if (trigger === 'mount') {
                animateIn();
            }


            /*
             * Scroll animation
             */
            if (trigger === 'scroll') {
                gsap.to(panels, {
                    rotateX: 0,
                    opacity: 1,
                    duration,
                    stagger,
                    ease,
                    overwrite: true,
                    scrollTrigger: {
                        trigger: container,
                        start: 'top 85%',
                        once: true,
                    },
                });
            }


            /*
             * Hover animation
             */
            if (trigger === 'hover') {
                const handleEnter = () => {
                    gsap.to(panels, {
                        rotateX: 0,
                        opacity: 1,
                        duration,
                        stagger,
                        ease,
                        overwrite: true,
                    });
                };

                const handleLeave = () => {
                    gsap.to(panels, {
                        rotateX:
                            hinge === 'bottom'
                                ? -90
                                : 90,
                        opacity: 0,
                        duration,
                        stagger,
                        ease,
                        overwrite: true,
                    });
                };

                container.addEventListener(
                    'mouseenter',
                    handleEnter
                );

                container.addEventListener(
                    'mouseleave',
                    handleLeave
                );

                return () => {
                    container.removeEventListener(
                        'mouseenter',
                        handleEnter
                    );

                    container.removeEventListener(
                        'mouseleave',
                        handleLeave
                    );
                };
            }

        }, container);

        return () => ctx.revert();

    }, [
        text,
        splitBy,
        hinge,
        trigger,
        duration,
        stagger,
        ease,
        perspective,
    ]);


    return (
        <span
            ref={containerRef}
            className={`fold-text ${className}`}
            style={{
                fontSize,
                fontWeight,
                color,
                perspective: `${perspective}px`,
            }}
            aria-label={text}
        >

            {units.map((unit, index) => {

                /*
                 * Preserve spaces when split by character/word.
                 */
                if (/^\s+$/.test(unit)) {
                    return (
                        <span
                            key={`space-${index}`}
                            className="fold-text-space"
                        >
                            {unit}
                        </span>
                    );
                }

                return (
                    <span
                        key={`${unit}-${index}`}
                        className="fold-text-unit"
                    >

                        <span
                            className="fold-text-panel"
                            style={{
                                '--crease-shading': creaseShading,
                            }}
                        >
                            {unit}
                        </span>

                    </span>
                );
            })}

        </span>
    );
};

export default FoldText;