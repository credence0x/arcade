import { useEffect, useState } from "react";

enum DeviceType {
  MOBILE,
  DESKTOP,
}

// Helper function to detect mobile device immediately
const isMobileDevice = () => {
  return typeof window !== "undefined" && window.innerWidth <= 1024;
};

export function useDevice() {
  const [device, setDevice] = useState<DeviceType>(
    isMobileDevice() ? DeviceType.MOBILE : DeviceType.DESKTOP,
  );

  useEffect(() => {
    const handleResize = () => {
      setDevice(
        window.innerWidth <= 1024 ? DeviceType.MOBILE : DeviceType.DESKTOP,
      );
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return {
    isMobile: device === DeviceType.MOBILE,
    isDesktop: device === DeviceType.DESKTOP,
  };
}
