import React from 'react';

const SkeletonLoader = ({ className, ...props }) => {
    return (
        <div
            className={`animate-pulse bg-gray-200 rounded-md ${className}`}
            {...props}
        />
    );
};

export const PageSkeleton = () => {
    return (
        <div className="p-8 w-full max-w-7xl mx-auto space-y-6">
            <SkeletonLoader className="h-12 w-1/3 mb-8 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SkeletonLoader className="h-64 w-full rounded-xl" />
                <SkeletonLoader className="h-64 w-full rounded-xl" />
                <SkeletonLoader className="h-64 w-full rounded-xl" />
            </div>
            <SkeletonLoader className="h-32 w-full mt-8 rounded-xl" />
        </div>
    );
};

export default SkeletonLoader;
