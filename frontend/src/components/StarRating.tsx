'use client';

import { useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

const sizeMap = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' };

export default function StarRating({
  rating,
  interactive = false,
  onChange,
  size = 'sm',
  showValue = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating ? hoverRating : rating;

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    let icon;
    if (displayRating >= i) {
      icon = <FaStar className="text-yellow-500" />;
    } else if (displayRating >= i - 0.5) {
      icon = <FaStarHalfAlt className="text-yellow-500" />;
    } else {
      icon = <FaRegStar className="text-yellow-500" />;
    }

    stars.push(
      <span
        key={i}
        className={`${sizeMap[size]} ${interactive ? 'cursor-pointer' : ''}`}
        onMouseEnter={() => interactive && setHoverRating(i)}
        onMouseLeave={() => interactive && setHoverRating(0)}
        onClick={() => interactive && onChange?.(i)}
      >
        {icon}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {stars}
      {showValue && (
        <span className="text-xs text-gray-400 ml-1">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
}
