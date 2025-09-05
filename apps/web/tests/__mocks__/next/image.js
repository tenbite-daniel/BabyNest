// __mocks__/next/image.js
import * as React from "react";

const NextImageMock = ({ src, alt, ...props }) => (
    <img src={src} alt={alt} {...props} />
);

export default NextImageMock;
