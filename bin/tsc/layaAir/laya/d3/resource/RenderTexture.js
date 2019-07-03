import { LayaGL } from "../../layagl/LayaGL";
import { Render } from "../../renders/Render";
import { BaseTexture } from "../../resource/BaseTexture";
import { Texture2D } from "../../resource/Texture2D";
import { WebGLContext } from "../../webgl/WebGLContext";
/**
   //* <code>RenderTexture</code> 类用于创建渲染目标。
 */
export class RenderTexture extends BaseTexture {
    /**
     * @param width  宽度。
     * @param height 高度。
     * @param format 纹理格式。
     * @param depthStencilFormat 深度格式。
     * 创建一个 <code>RenderTexture</code> 实例。
     */
    constructor(width, height, format = BaseTexture.FORMAT_R8G8B8, depthStencilFormat = BaseTexture.FORMAT_DEPTH_16) {
        super(format, false);
        /** @internal */
        this._inPool = false;
        this._glTextureType = WebGL2RenderingContext.TEXTURE_2D;
        this._width = width;
        this._height = height;
        this._depthStencilFormat = depthStencilFormat;
        this._create(width, height);
    }
    /**
     * 获取当前激活的Rendertexture。
     */
    static get currentActive() {
        return RenderTexture._currentActive;
    }
    /**
     *从对象池获取临时渲染目标。
     */
    static createFromPool(width, height, format = BaseTexture.FORMAT_R8G8B8, depthStencilFormat = BaseTexture.FORMAT_DEPTH_16, filterMode = BaseTexture.FILTERMODE_BILINEAR) {
        var tex;
        for (var i = 0, n = RenderTexture._pool.length; i < n; i++) {
            tex = RenderTexture._pool[i];
            if (tex._width == width && tex._height == height && tex._format == format && tex._depthStencilFormat == depthStencilFormat && tex._filterMode == filterMode) {
                tex._inPool = false;
                var end = RenderTexture._pool[n - 1];
                RenderTexture._pool[i] = end;
                RenderTexture._pool.length -= 1;
                return tex;
            }
        }
        tex = new RenderTexture(width, height, format, depthStencilFormat);
        tex.filterMode = filterMode;
        tex.lock = true; //TODO:资源不加锁会被GC掉,或GC时对象池清空
        return tex;
    }
    /**
     * 回收渲染目标到对象池,释放后可通过createFromPool复用。
     */
    static recoverToPool(renderTexture) {
        if (renderTexture._inPool)
            return;
        RenderTexture._pool.push(renderTexture);
        renderTexture._inPool = true;
    }
    /**
     * 获取深度格式。
     *@return 深度格式。
     */
    get depthStencilFormat() {
        return this._depthStencilFormat;
    }
    /**
     * @inheritDoc
     */
    /*override*/ get defaulteTexture() {
        return Texture2D.grayTexture;
    }
    /**
     * @internal
     */
    _texImage2D(gl, glTextureType, width, height) {
        var glFormat;
        switch (this._format) {
            case BaseTexture.FORMAT_R8G8B8:
                gl.texImage2D(glTextureType, 0, WebGL2RenderingContext.RGB, width, height, 0, WebGL2RenderingContext.RGB, WebGL2RenderingContext.UNSIGNED_BYTE, null);
                break;
            case BaseTexture.FORMAT_R8G8B8A8:
                gl.texImage2D(glTextureType, 0, WebGL2RenderingContext.RGBA, width, height, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, null);
                break;
            case BaseTexture.FORMAT_ALPHA8:
                gl.texImage2D(glTextureType, 0, WebGL2RenderingContext.ALPHA, width, height, 0, WebGL2RenderingContext.ALPHA, WebGL2RenderingContext.UNSIGNED_BYTE, null);
                break;
            case BaseTexture.RENDERTEXTURE_FORMAT_RGBA_HALF_FLOAT:
                if (LayaGL.layaGPUInstance._isWebGL2)
                    gl.texImage2D(this._glTextureType, 0, WebGL2RenderingContext.RGBA16F, width, height, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.HALF_FLOAT, null);
                else
                    gl.texImage2D(this._glTextureType, 0, WebGL2RenderingContext.RGBA, width, height, 0, WebGL2RenderingContext.RGBA, LayaGL.layaGPUInstance._oesTextureHalfFloat.HALF_FLOAT_OES, null); //内部格式仍为RGBA
                break;
            default:
                break;
        }
    }
    /**
     * @internal
     */
    _create(width, height) {
        var gl = LayaGL.instance;
        this._frameBuffer = gl.createFramebuffer();
        WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
        this._texImage2D(gl, this._glTextureType, width, height);
        this._setGPUMemory(width * height * 4);
        gl.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, this._frameBuffer);
        gl.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT0, WebGL2RenderingContext.TEXTURE_2D, this._glTexture, 0);
        if (this._depthStencilFormat !== BaseTexture.FORMAT_DEPTHSTENCIL_NONE) {
            this._depthStencilBuffer = gl.createRenderbuffer();
            gl.bindRenderbuffer(WebGL2RenderingContext.RENDERBUFFER, this._depthStencilBuffer);
            switch (this._depthStencilFormat) {
                case BaseTexture.FORMAT_DEPTH_16:
                    gl.renderbufferStorage(WebGL2RenderingContext.RENDERBUFFER, WebGL2RenderingContext.DEPTH_COMPONENT16, width, height);
                    gl.framebufferRenderbuffer(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.DEPTH_ATTACHMENT, WebGL2RenderingContext.RENDERBUFFER, this._depthStencilBuffer);
                    break;
                case BaseTexture.FORMAT_STENCIL_8:
                    gl.renderbufferStorage(WebGL2RenderingContext.RENDERBUFFER, WebGL2RenderingContext.STENCIL_INDEX8, width, height);
                    gl.framebufferRenderbuffer(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.STENCIL_ATTACHMENT, WebGL2RenderingContext.RENDERBUFFER, this._depthStencilBuffer);
                    break;
                case BaseTexture.FORMAT_DEPTHSTENCIL_16_8:
                    gl.renderbufferStorage(WebGL2RenderingContext.RENDERBUFFER, WebGL2RenderingContext.DEPTH_STENCIL, width, height);
                    gl.framebufferRenderbuffer(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.DEPTH_STENCIL_ATTACHMENT, WebGL2RenderingContext.RENDERBUFFER, this._depthStencilBuffer);
                    break;
                default:
                    throw "RenderTexture: unkonw depth format.";
            }
        }
        gl.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, null);
        gl.bindRenderbuffer(WebGL2RenderingContext.RENDERBUFFER, null);
        this._setWarpMode(WebGL2RenderingContext.TEXTURE_WRAP_S, this._wrapModeU);
        this._setWarpMode(WebGL2RenderingContext.TEXTURE_WRAP_T, this._wrapModeV);
        this._setFilterMode(this._filterMode);
        this._setAnisotropy(this._anisoLevel);
        this._readyed = true;
        this._activeResource();
    }
    /**
     * @internal
     */
    _start() {
        LayaGL.instance.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, this._frameBuffer);
        RenderTexture._currentActive = this;
        this._readyed = false;
    }
    /**
     * @internal
     */
    _end() {
        LayaGL.instance.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, null);
        RenderTexture._currentActive = null;
        this._readyed = true;
    }
    /**
     * 获得像素数据。
     * @param x X像素坐标。
     * @param y Y像素坐标。
     * @param width 宽度。
     * @param height 高度。
     * @return 像素数据。
     */
    getData(x, y, width, height, out) {
        if (Render.isConchApp && window.conchConfig.threadMode == 2) {
            throw "native 2 thread mode use getDataAsync";
        }
        var gl = LayaGL.instance;
        gl.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, this._frameBuffer);
        var canRead = (gl.checkFramebufferStatus(WebGL2RenderingContext.FRAMEBUFFER) === WebGL2RenderingContext.FRAMEBUFFER_COMPLETE);
        if (!canRead) {
            gl.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, null);
            return null;
        }
        gl.readPixels(x, y, width, height, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, out);
        gl.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, null);
        return out;
    }
    /**
     * native多线程
     */
    getDataAsync(x, y, width, height, callBack) {
        var gl = LayaGL.instance;
        gl.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, this._frameBuffer);
        gl.readPixelsAsync(x, y, width, height, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, function (data) {
            callBack(new Uint8Array(data));
        });
        gl.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, null);
    }
    /**
     * @inheritDoc
     */
    /*override*/ _disposeResource() {
        if (this._frameBuffer) {
            var gl = LayaGL.instance;
            gl.deleteTexture(this._glTexture);
            gl.deleteFramebuffer(this._frameBuffer);
            gl.deleteRenderbuffer(this._depthStencilBuffer);
            this._glTexture = null;
            this._frameBuffer = null;
            this._depthStencilBuffer = null;
            this._setGPUMemory(0);
        }
    }
}
/** @internal */
RenderTexture._pool = [];
