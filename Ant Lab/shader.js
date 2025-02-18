const FLOAT_SIZE_BYTES = 4; //float = 32 bits, byte = 8 bits
const STRIDE = 7 * FLOAT_SIZE_BYTES;
const VERTEX_COLOR_OFFSET = 3 * FLOAT_SIZE_BYTES;

const VERTEX_SRC =
    `#version 300 es

        in vec4 position;
        in vec4 color;
        in float pointSize;

        out vec4 linkedColor;
        out vec4 linkedPosition;
        void main(){
            
           gl_Position = position;
           
         if(position.z == 1.0){
              gl_PointSize = 3.0*pointSize;
              if(color.a == 2.0){
                gl_PointSize = 15.0*pointSize;
              }
              else if(color.b == 0.0){
                gl_PointSize = 8.0*pointSize;
              }
           }
           else if(position.z == 0.0){
               if(color.r > 0.0){
                  gl_PointSize = 7.0*pointSize;
               }
               else if(color.a > 0.0){
                gl_PointSize = 3.0*pointSize;
               }
               else{
                 gl_PointSize = 1.0*pointSize;
               }
           }
     
           linkedColor = color;
           linkedPosition = position;
        }        `
    ;
const FRAGMENT_SRC =
    `#version 300 es
        precision mediump float;

        in vec4 linkedColor;
        in vec4 linkedPosition;
        out vec4 color;

        void main(){
            vec2 coord = gl_PointCoord - vec2(0.5);
            if(length(coord) > 0.5 && (linkedColor.r ==0.0 || linkedPosition.z == 1.0)){                  //outside of circle radius?
                discard;
            }
            else{
                color = vec4(0.0,0.0,0.0,1.0);
        
                if(linkedPosition.z == 0.0 ){
                    if(linkedColor.r >0.0){
                     color = vec4(0.15,0.15,0.2,1.0);
                    }
                     else if(linkedColor.a >0.0){
                        color = vec4(0.8*linkedColor.a,0.7*linkedColor.a,0.0,1.0);
                    }
                
                    else if(linkedColor.g+linkedColor.b > 0.0){
                        color = vec4(linkedColor.b,0.8*(linkedColor.g+linkedColor.b),0.8*linkedColor.g ,1.0);
                        //color = linkedColor;
                    }
               
                }
                else{
                    color = linkedColor;
                }
            }
        }
        `
    ;

class Shader {
    constructor() {
        this.program = this.createShaders();
        this.getPropertyLocations();

    }

    program;
    propertyLocationPosition;
    propertyLocationColor;
    propertyLocationPointSize;

    // Store references to attributes in shader
    getPropertyLocations() {
        this.propertyLocationPosition = GL.getAttribLocation(this.program, "position");
        this.propertyLocationColor = GL.getAttribLocation(this.program, "color");
        this.propertyLocationPointSize = GL.getAttribLocation(this.program, "pointSize");

        GL.enableVertexAttribArray(this.propertyLocationPosition)
        GL.enableVertexAttribArray(this.propertyLocationColor)
    }


    // Create and attach vertex and fragment shader to new shader program
    createShaders() {
        var vertexShader = this.getAndCompileShader(VERTEX_SRC, GL.VERTEX_SHADER);
        var fragmentShader = this.getAndCompileShader(FRAGMENT_SRC, GL.FRAGMENT_SHADER);

        var newShaderProgram = GL.createProgram();
        GL.attachShader(newShaderProgram, vertexShader);
        GL.attachShader(newShaderProgram, fragmentShader);

        GL.linkProgram(newShaderProgram);
        return newShaderProgram;
    }

    // Convert string to shader 
    getAndCompileShader(source, shaderType) {
        var shaderText = source.trim();
        var newShader = GL.createShader(shaderType);
        GL.shaderSource(newShader, shaderText);
        GL.compileShader(newShader);

        if (!GL.getShaderParameter(newShader, GL.COMPILE_STATUS)) {
            alert(GL.getShaderInfoLog(newShader));
            return null;
        }

        return newShader;
    }


}