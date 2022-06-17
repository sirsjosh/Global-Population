
varying vec3 vNomal;
void main(){
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    vNomal=normalize(normalMatrix*normal);
}