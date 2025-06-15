import React from 'react';
import PropTypes from 'prop-types';

function DropdownMenu({ items, style }) {
  return (
    <div style={{ ...defaultStyle, ...style }}>
      {items.map((item) => (
        <button
          key={item.key || (typeof item.label === 'string' ? item.label : Math.random())}
          style={{ ...itemStyle, background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
          onClick={item.onClick}
          type="button"
          role="menuitem"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (item.onClick) item.onClick(e);
            }
          }}
        >
          {item.label}
        </button>
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
DropdownMenu.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node.isRequired,
      onClick: PropTypes.func
    })
  ).isRequired,
  style: PropTypes.object
};

export default DropdownMenu;
