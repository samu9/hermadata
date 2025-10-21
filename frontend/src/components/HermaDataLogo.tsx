import React from "react"
import "./HermaDataLogo.css"

interface HermaDataLogoProps {
    size?: number | "small" | "medium" | "large" | "xl"
    className?: string
    animate?: boolean
    color?: string
    theme?: "default" | "blue" | "green" | "red"
}

const HermaDataLogo: React.FC<HermaDataLogoProps> = ({
    size = 100,
    className = "",
    animate = true,
    color = "#000000",
    theme = "default",
}) => {
    // Handle size prop
    const sizeClasses = typeof size === "string" ? `hermadata-logo-${size}` : ""
    const sizeStyle =
        typeof size === "number" ? { width: size, height: size } : {}

    // Handle theme classes
    const themeClass = theme !== "default" ? `hermadata-logo-${theme}` : ""

    return (
        <svg
            viewBox="0 0 300 300"
            className={`hermadata-logo ${className} ${
                animate ? "hermadata-logo-animated" : ""
            } ${sizeClasses} ${themeClass}`.trim()}
            style={{
                fill: color,
                ...sizeStyle,
            }}
        >
            {/* Main logo path with drawing animation */}
            <g transform="translate(0,300) scale(0.1,-0.1)">
                <path
                    d="M971 2304 c-166 -44 -321 -177 -400 -344 -33 -68 -36 -84 -38 -168 0
-51 -7 -132 -13 -179 -63 -442 241 -844 736 -974 128 -34 349 -34 479 0 110
29 241 84 315 133 321 214 463 535 391 883 -31 150 -118 344 -208 463 -83 109
-91 105 -189 -76 -36 -68 -43 -75 -102 -103 -34 -17 -84 -52 -110 -78 l-47
-48 -97 48 c-53 27 -101 57 -106 66 -5 10 -15 47 -22 83 -15 82 -40 131 -95
185 -50 51 -121 89 -202 110 -72 19 -221 18 -292 -1z m224 -54 c126 -19 231
-83 274 -169 10 -20 26 -72 35 -115 9 -44 21 -85 27 -93 7 -7 53 -34 103 -59
l91 -46 -3 -56 c-6 -90 -65 -173 -149 -209 -39 -16 -121 -17 -228 -2 -144 20
-195 -23 -195 -167 0 -70 4 -89 30 -141 37 -75 126 -172 225 -248 l75 -58 -62
-66 c-35 -36 -74 -80 -88 -98 l-25 -32 -112 37 c-159 55 -257 116 -383 242
-85 84 -114 121 -147 185 -69 134 -99 270 -88 389 l7 68 47 -46 c60 -59 125
-87 204 -88 100 -2 162 44 197 145 25 70 27 213 5 318 -20 95 -37 116 -68 84
-13 -12 -13 -23 0 -82 19 -84 22 -234 6 -288 -7 -22 -25 -55 -40 -74 -68 -80
-226 -36 -303 86 -79 124 -28 291 137 443 79 73 160 119 243 136 70 16 98 16
185 4z m1070 -315 c30 -60 69 -153 87 -205 31 -91 33 -102 33 -245 0 -158 -13
-222 -67 -329 -105 -208 -325 -377 -583 -448 -79 -22 -345 -38 -345 -21 0 25
188 198 320 293 215 156 281 229 297 327 7 42 -8 55 -53 47 -52 -10 -149 24
-199 68 -69 61 -71 70 -30 124 46 60 59 86 80 156 13 47 26 66 75 111 34 32
79 62 107 73 26 9 53 21 58 25 6 4 33 50 60 103 l50 96 28 -33 c15 -17 52 -81
82 -142z m-611 -502 c15 -30 56 -70 97 -95 33 -21 125 -48 161 -48 26 0 28 -2
18 -21 -31 -58 -125 -140 -308 -273 l-93 -67 -72 59 c-148 122 -218 209 -238
299 -14 61 -3 130 22 146 12 7 56 6 145 -2 129 -13 182 -9 224 19 23 15 28 12
44 -17z"
                    className={animate ? "main-path" : ""}
                    style={{
                        fill: color,
                        stroke: color,
                    }}
                />

                {/* Eye elements with pulse animation */}
                <path
                    d="M1266 1938 c-23 -33 -19 -64 11 -87 28 -23 54 -21 86 7 39 34 8 102
-48 102 -24 0 -39 -7 -49 -22z"
                    className={animate ? "eye-left" : ""}
                    style={{ fill: color }}
                />

                <path
                    d="M1923 1688 c-44 -21 -41 -82 4 -99 56 -21 100 54 55 94 -21 19 -28
20 -59 5z"
                    className={animate ? "eye-right" : ""}
                    style={{ fill: color }}
                />
            </g>
        </svg>
    )
}

export default HermaDataLogo
