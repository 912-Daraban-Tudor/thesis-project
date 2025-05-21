export const flyToWithOffset = (map, lng, lat, listIsOpen, isMobile) => {
    const offsetLng = listIsOpen && !isMobile ? lng - 0.007 : lng;

    map.flyTo({
        center: [offsetLng, lat],
        zoom: 14,
        speed: 1.5,
        curve: 1.42,
        easing: (t) => t,
    });
};
