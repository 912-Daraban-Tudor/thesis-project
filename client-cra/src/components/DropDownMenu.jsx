// src/components/DropdownMenu.jsx
import React from 'react';

function DropdownMenu({ items, style }) {
  return (
    <div style={{ ...defaultStyle, ...style }}>
      {items.map((item, index) => (
        <div
          key={index}
          style={itemStyle}
          onClick={item.onClick}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}

const defaultStyle = {
  position: 'absolute',
  top: '60px',
  backgroundColor: '#fff',
  color: '#333',
  border: '1px solid #ddd',
  borderRadius: '4px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  minWidth: '150px',
  zIndex: 20,
};

const itemStyle = {
  padding: '0.75rem 1rem',
  cursor: 'pointer',
  borderBottom: '1px solid #eee',
};

export default DropdownMenu;
