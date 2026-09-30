"use client";
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type MapView from "./MapView";

const Map = dynamic(() => import("./MapView"), { ssr: false, loading: () => <p>Karte wird geladen …</p> });
export default function MapLoader(props: ComponentProps<typeof MapView>) { return <Map {...props} />; }
