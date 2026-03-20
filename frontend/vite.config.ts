import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./src/test/setup.ts"],
        css: false,
        coverage: {
            provider: "v8",
            reporter: ["text", "lcov"],
            exclude: ["node_modules/", "src/test/"],
        },
    },
})
