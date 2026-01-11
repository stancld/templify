import React from 'react';
import { Field } from '../../types';

interface FieldConnectorProps {
  fieldCardRect: DOMRect | null;
  highlightRect: DOMRect | null;
  activeFieldId: string | null;
  fields: Field[];
}

const getFieldColor = (type: string): string => {
  const colors = {
    text: '#3F8AE2',
    number: '#00eb82',
    date: '#AE33EC',
  };
  return colors[type as keyof typeof colors] || colors.text;
};

export const FieldConnector: React.FC<FieldConnectorProps> = ({
  fieldCardRect,
  highlightRect,
  activeFieldId,
  fields,
}) => {
  if (!fieldCardRect || !highlightRect || !activeFieldId) {
    return null;
  }

  const activeField = fields.find((f) => f.id === activeFieldId);
  const color = activeField ? getFieldColor(activeField.type) : '#3F8AE2';

  const startX = highlightRect.right;
  const startY = highlightRect.top + highlightRect.height / 2;

  const endX = fieldCardRect.left;
  const endY = fieldCardRect.top + fieldCardRect.height / 2;

  const controlPointOffset = Math.min(80, Math.abs(endX - startX) / 2);
  const controlX1 = startX + controlPointOffset;
  const controlX2 = endX - controlPointOffset;

  const pathD = `M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX2} ${endY}, ${endX} ${endY}`;

  return (
    <svg
      className="fixed inset-0 pointer-events-none z-40"
      style={{ width: '100vw', height: '100vh' }}
    >
      <defs>
        <filter id="connector-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeDasharray="6 4"
        filter="url(#connector-glow)"
        className="animate-dash"
      />

      <circle
        cx={startX}
        cy={startY}
        r={5}
        fill={color}
        filter="url(#connector-glow)"
      />

      <circle
        cx={endX}
        cy={endY}
        r={5}
        fill={color}
        filter="url(#connector-glow)"
      />

      <style>{`
        @keyframes dashMove {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-dash {
          animation: dashMove 1s linear infinite;
        }
      `}</style>
    </svg>
  );
};
