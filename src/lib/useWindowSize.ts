import { useEffect, useState } from 'react';

type WindowSize = {
    windowWidth: number | undefined;
    windowHeight: number | undefined;
};

const useWindowSize = (): WindowSize => {
    const [windowSize, setWindowSize] = useState<WindowSize>({
        windowWidth: undefined,
        windowHeight: undefined,
    });
    useEffect(() => {
        function handleResize(): void {
            setWindowSize({
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
            });
        }
        handleResize();
        window.addEventListener('resize', handleResize);
        return (): void => window.removeEventListener('resize', handleResize);
    }, []); // Empty array ensures that effect is only run on mount

    return windowSize;
};

export default useWindowSize;