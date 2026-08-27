import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';

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

  const containerRef = useRef(null);
  const itemRefs = useRef([]);

  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);

  const targetValues = useRef([]);
  const currentValues = useRef([]);

  const [selectedIndex, setSelectedIndex] =
    useState(activeIndex);


  /* =====================================================
     Keep selected item synchronized with App
     ===================================================== */

  useEffect(() => {

    setSelectedIndex(activeIndex);

  }, [activeIndex]);


  /* =====================================================
     Animation loop
     ===================================================== */

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


  /* =====================================================
     Start animation
     ===================================================== */

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


  /* =====================================================
     Cursor proximity
     ===================================================== */

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


          /*
           * Smooth falloff
           */
          strength =
            strength *
            strength *
            (3 - 2 * strength);


          /*
           * Keep active item slightly highlighted
           */
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


  /* =====================================================
     Cursor leaves sidebar
     ===================================================== */

  const handlePointerLeave =
    useCallback(() => {

      targetValues.current =
        targetValues.current.map(
          () => 0
        );


      /*
       * Keep active item slightly visible
       */
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


  /* =====================================================
     Click
     ===================================================== */

  const handleClick =
    (index) => {

      setSelectedIndex(index);

      if (onItemClick) {

        onItemClick(
          index,
          items[index]
        );

      }

    };


  /* =====================================================
     Cleanup
     ===================================================== */

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


  /* =====================================================
     Initialize arrays
     ===================================================== */

  useEffect(() => {

    targetValues.current =
      items.map(() => 0);

    currentValues.current =
      items.map(() => 0);

  }, [items.length]);


  /* =====================================================
     RENDER
     ===================================================== */

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
          (item, index) => (

            <div
              key={`${item}-${index}`}

              ref={(element) => {

                itemRefs.current[index] =
                  element;

              }}

              className={`
                line-sidebar-item
                ${
                  selectedIndex === index
                    ? 'line-sidebar-item-active'
                    : ''
                }
              `}

              onClick={() =>
                handleClick(index)
              }
            >

              {/* Horizontal marker */}

              {showMarker && (

                <div
                  className="line-sidebar-marker"
                />

              )}


              {/* Number */}

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


              {/* Label */}

              <span
                className="line-sidebar-label"
              >
                {item}
              </span>

            </div>

          )
        )}

      </div>

    </nav>
  );
};


export default LineSidebar;