import React, { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';

const ResizableImageComponent = ({ node, updateAttributes, selected }) => {
  const { src, width, height, alignment } = node.attrs;
  const imgRef = useRef();

  const [currentWidth, setCurrentWidth] = useState(width);
  const [resizing, setResizing] = useState(false);

  const startResize = () => setResizing(true);
  const stopResize = () => setResizing(false);

  const onMouseMove = (e) => {
    if (resizing) {
      const newWidth = e.clientX - imgRef.current.getBoundingClientRect().left;
      setCurrentWidth(`${newWidth}px`);
    }
  };

  const onMouseUp = () => {
    if (resizing) {
      stopResize();
      updateAttributes({ width: currentWidth });
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [resizing]);

  const getAlignmentStyle = () => {
    switch (alignment) {
      case 'left':
        return { justifyContent: 'flex-start' };
      case 'right':
        return { justifyContent: 'flex-end' };
      case 'center':
      default:
        return { justifyContent: 'center' };
    }
  };

  return (
    <NodeViewWrapper
      className="resizable-image"
      style={{
        position: 'relative',
        display: 'flex',
        ...getAlignmentStyle(),
        margin: '1rem 0',
      }}
    >
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <img
          ref={imgRef}
          src={src}
          width={currentWidth}
          height={height}
          style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
          alt=""
        />
        {selected && (
          <div
            onMouseDown={startResize}
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: '10px',
              height: '10px',
              background: 'blue',
              cursor: 'nwse-resize',
            }}
          />
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default ResizableImageComponent;
