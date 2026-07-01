import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import PageWrapper from "./components/layout/PageWrapper.jsx";
import MainLayout from "./components/layout/MainLayout.jsx";
import { PageSkeleton } from "./components/feedback/SkeletonLoader.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";

// Pages - Lazy loaded except Home
import Home from "./pages/Home/Home.jsx";
const DFA = lazy(() => import("./pages/DFA/DFA.jsx"));
const Regex = lazy(() => import("./pages/Regex/Regex.jsx"));
const PDA = lazy(() => import("./pages/PDA/PDA.jsx"));
const CNF = lazy(() => import("./pages/CNF/CNF.jsx"));
const Documentation = lazy(() => import("./pages/Documentation/Documentation.jsx"));
const About = lazy(() => import("./pages/About/About.jsx"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound.jsx"));

export default function App() {
    const location = useLocation();

    return (
        <ErrorBoundary>
            <ThemeProvider>
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        <Route path="/" element={<MainLayout />}>
                            <Route index element={<PageWrapper><Home /></PageWrapper>} />
                            <Route path="dfa" element={<Suspense fallback={<PageSkeleton />}><PageWrapper><DFA /></PageWrapper></Suspense>} />
                            <Route path="regex" element={<Suspense fallback={<PageSkeleton />}><PageWrapper><Regex /></PageWrapper></Suspense>} />
                            <Route path="pda" element={<Suspense fallback={<PageSkeleton />}><PageWrapper><PDA /></PageWrapper></Suspense>} />
                            <Route path="cnf" element={<Suspense fallback={<PageSkeleton />}><PageWrapper><CNF /></PageWrapper></Suspense>} />
                            <Route path="documentation" element={<Suspense fallback={<PageSkeleton />}><PageWrapper><Documentation /></PageWrapper></Suspense>} />
                            <Route path="about" element={<Suspense fallback={<PageSkeleton />}><PageWrapper><About /></PageWrapper></Suspense>} />
                            <Route path="*" element={<Suspense fallback={<PageSkeleton />}><PageWrapper><NotFound /></PageWrapper></Suspense>} />
                        </Route>
                    </Routes>
                </AnimatePresence>
            </ThemeProvider>
        </ErrorBoundary>
    );
}