varying vec2 vuv;
varying vec3 vNomal;

void main(){
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    vuv=uv;
   vNomal=normalize(normalMatrix*normal);
}