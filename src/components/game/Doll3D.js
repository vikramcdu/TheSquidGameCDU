import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import dollGLB from '../../assets/models/squid_game_doll.glb';


export default function Doll3D({ isGreenLight }) {
  const group = useRef();
  // const { scene, nodes } = useGLTF('../assets/models/squid_game_doll/scene.glb');
  const { scene } = useGLTF(dollGLB);
  useFrame(() => {
    if (group.current) {
      const targetY = isGreenLight ? 0 : Math.PI; // 180° turn
      group.current.rotation.y += (targetY - group.current.rotation.y) * 0.1;
    }
  });
  
  return <primitive ref={group} object={scene} scale={2} position={[0, -5, 0]} />;
  }


