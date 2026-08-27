import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import './LineSidebar.css';

const LineSidebar = ({
  items = [],
  activeIndex = 0,
  onItemClick,

  accentColor = '#8FE3CF',
  textColor = '#8A8F9C',
  markerColor = '#4B4D56',

  proximityRadius = 120,
  maxShift = 18,

  markerLength = 54,
  markerGap = 18,

  itemGap = 8,

  showIndex = true,
  showMarker = true,

  fontSize = 0.95,

  smoothing = 70,
}) => {

  const location = useLocation();
  const containerRef = useRef(null);
  const itemRefs = useRef([]);

  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);

  const targetValues = useRef([]);
  const currentValues = useRef([]);

  
  const currentPathIndex = items.findIndex((it) => {
    const p = typeof it === 'object' ? it.path : (it.toLowerCase() === 'dashboard' ? '/dashboard' : `/${it.toLowerCase().replace(/\s+/g, '-')}`);
    return location.pathname === p || (p === '/dashboard' && location.pathname === '/');
  });

  const effectiveActiveIndex = currentPathIndex >= 0 ? currentPathIndex : activeIndex;

  const [selectedIndex, setSelectedIndex] =
    useState(effectiveActiveIndex);

  

  useEffect(() => {

    setSelectedIndex(effectiveActiveIndex);

  }, [effectiveActiveIndex]);

  

  const animate = useCallback(
    (time) => {

      const delta =
        Math.min(
          (time - lastTimeRef.current) / 1000,
          0.05
        );

      lastTimeRef.current = time;

      const duration =
        Math.max(smoothing, 1) / 1000;

      const interpolation =
        1 - Math.exp(-delta / duration);

      let stillMoving = false;

      itemRefs.current.forEach(
        (item, index) => {

          if (!item) return;

          const target =
            targetValues.current[index] || 0;

          const current =
            currentValues.current[index] || 0;

          const next =
            current +
            (target - current) *
            interpolation;

          currentValues.current[index] =
            next;

          item.style.setProperty(
            '--hover-strength',
            next.toFixed(4)
          );

          if (
            Math.abs(target - next) >
            0.001
          ) {

            stillMoving = true;

          }

        }
      );

      if (stillMoving) {

        animationRef.current =
          requestAnimationFrame(
            animate
          );

      } else {

        animationRef.current = null;

      }

    },
    [smoothing]
  );

  

  const startAnimation = useCallback(() => {

    if (
      animationRef.current !== null
    ) {

      cancelAnimationFrame(
        animationRef.current
      );

    }

    lastTimeRef.current =
      performance.now();

    animationRef.current =
      requestAnimationFrame(
        animate
      );

  }, [animate]);

  

  const handlePointerMove = useCallback(
    (event) => {

      const container =
        containerRef.current;

      if (!container) return;

      const containerRect =
        container.getBoundingClientRect();

      const pointerY =
        event.clientY -
        containerRect.top;

      itemRefs.current.forEach(
        (item, index) => {

          if (!item) return;

          const itemTop =
            item.offsetTop;

          const itemCenter =
            itemTop +
            item.offsetHeight / 2;

          const distance =
            Math.abs(
              pointerY -
              itemCenter
            );

          let strength =
            1 -
            distance /
            proximityRadius;

          strength =
            Math.max(
              0,
              Math.min(
                1,
                strength
              )
            );

          
          strength =
            strength *
            strength *
            (3 - 2 * strength);

          
          if (
            selectedIndex === index
          ) {

            strength =
              Math.max(
                strength,
                0.25
              );

          }

          targetValues.current[index] =
            strength;

        }
      );

      startAnimation();

    },
    [
      proximityRadius,
      selectedIndex,
      startAnimation,
    ]
  );

  

  const handlePointerLeave =
    useCallback(() => {

      targetValues.current =
        targetValues.current.map(
          () => 0
        );

      
      if (
        selectedIndex >= 0 &&
        selectedIndex <
          targetValues.current.length
      ) {

        targetValues.current[
          selectedIndex
        ] = 0.25;

      }

      startAnimation();

    }, [
      selectedIndex,
      startAnimation,
    ]);

  

  const handleClick =
    (e, index, item) => {

      setSelectedIndex(index);

      if (onItemClick) {

        onItemClick(
          e,
          index,
          item
        );

      }

    };

  

  useEffect(() => {

    return () => {

      if (
        animationRef.current !== null
      ) {

        cancelAnimationFrame(
          animationRef.current
        );

      }

    };

  }, []);

  

  useEffect(() => {

    targetValues.current =
      items.map(() => 0);

    currentValues.current =
      items.map(() => 0);

  }, [items.length]);

  

  return (

    <nav
      ref={containerRef}
      className="line-sidebar"

      style={{
        '--sidebar-accent':
          accentColor,

        '--sidebar-text':
          textColor,

        '--sidebar-marker':
          markerColor,

        '--marker-length':
          `${markerLength}px`,

        '--marker-gap':
          `${markerGap}px`,

        '--item-gap':
          `${itemGap}px`,

        '--sidebar-font-size':
          `${fontSize}rem`,

        '--max-shift':
          `${maxShift}px`,
      }}

      onPointerMove={
        handlePointerMove
      }

      onPointerLeave={
        handlePointerLeave
      }
    >

      <div className="line-sidebar-list">

        {items.map(
          (item, index) => {
            const itemLabel = typeof item === 'object' ? item.name : item;
            const itemPath = typeof item === 'object' ? item.path : (item.toLowerCase() === 'dashboard' ? '/dashboard' : `/${item.toLowerCase().replace(/\s+/g, '-')}`);

            return (
              <NavLink
                key={`${itemLabel}-${index}`}
                to={itemPath}

                ref={(element) => {

                  itemRefs.current[index] =
                    element;

                }}

                className={({ isActive }) => `
                  line-sidebar-item
                  ${
                    isActive || selectedIndex === index
                      ? 'line-sidebar-item-active'
                      : ''
                  }
                `}

                onClick={(e) =>
                  handleClick(e, index, item)
                }
              >

                {}

                {showMarker && (

                  <div
                    className="line-sidebar-marker"
                  />

                )}

                {}

                {showIndex && (

                  <span
                    className="line-sidebar-index"
                  >
                    {String(index + 1).padStart(
                      2,
                      '0'
                    )}
                  </span>

                )}

                {}

                <span
                  className="line-sidebar-label"
                >
                  {itemLabel}
                </span>

              </NavLink>
            );
          }
        )}

      </div>

    </nav>
  );
};

export default LineSidebar;