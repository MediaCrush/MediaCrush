(function(libjass, global) {
    /**
     * libjass
     *
     * https://github.com/Arnavion/libjass
     *
     * Copyright 2013 Arnav Singh
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    "use strict";
    (function(libjass) {
        /**
         * Set implementation for browsers that don't support it. Only supports Number and String elements.
         *
         * Elements are stored as properties of an object, with names derived from their type.
         *
         * @constructor
         * @template T
         *
         * @private
         * @memberof libjass
         */
        var SimpleSet = function() {
            function SimpleSet() {
                this.clear();
            }
            /**
             * @param {T} value
             * @return {libjass.Set.<T>} This set
             */
            SimpleSet.prototype.add = function(value) {
                var property = this._toProperty(value);
                if (property === null) {
                    throw new Error("This Set implementation only supports Number and String values.");
                }
                this._elements[property] = value;
                return this;
            };
            /**
             */
            SimpleSet.prototype.clear = function() {
                this._elements = Object.create(null);
            };
            /**
             * @param {T} value
             * @return {boolean}
             */
            SimpleSet.prototype.has = function(value) {
                var property = this._toProperty(value);
                if (property === null) {
                    return false;
                }
                return property in this._elements;
            };
            /**
             * @param {function(T, T, libjass.Set.<T>)} callbackfn A function that is called with each value in the set.
             */
            SimpleSet.prototype.forEach = function(callbackfn, thisArg) {
                var _this = this;
                Object.keys(this._elements).map(function(property) {
                    var element = _this._elements[property];
                    callbackfn.call(thisArg, element, element, _this);
                });
            };
            SimpleSet.prototype.delete = function() {
                throw new Error("This Set implementation doesn't support delete().");
            };
            Object.defineProperty(SimpleSet.prototype, "size", {
                get: function() {
                    throw new Error("This Set implementation doesn't support size.");
                },
                enumerable: true,
                configurable: true
            });
            SimpleSet.prototype._toProperty = function(value) {
                if (typeof value === "number") {
                    return "#" + value;
                }
                if (typeof value === "string") {
                    return "'" + value;
                }
                return null;
            };
            return SimpleSet;
        }();
        libjass.Set = null;
        // Use this browser's implementation of Set if it has one
        if (global.Set !== undefined && typeof global.Set.prototype.forEach === "function") {
            libjass.Set = global.Set;
        } else {
            libjass.Set = SimpleSet;
        }
        /**
         * Map implementation for browsers that don't support it. Only supports Number and String keys.
         *
         * Keys and values are stored as properties of an object, with property names derived from the key type.
         *
         * @constructor
         * @template K, V
         *
         * @private
         * @memberof libjass
         */
        var SimpleMap = function() {
            function SimpleMap() {
                this.clear();
            }
            /**
             * @param {K} key
             * @return {V}
             */
            SimpleMap.prototype.get = function(key) {
                var property = this._keyToProperty(key);
                if (property === null) {
                    return undefined;
                }
                return this._values[property];
            };
            /**
             * @param {K} key
             * @return {boolean}
             */
            SimpleMap.prototype.has = function(key) {
                var property = this._keyToProperty(key);
                if (property === null) {
                    return false;
                }
                return property in this._keys;
            };
            /**
             * @param {K} key
             * @param {V} value
             * @return {libjass.Map.<K, V>} This map
             */
            SimpleMap.prototype.set = function(key, value) {
                var property = this._keyToProperty(key);
                if (property === null) {
                    throw new Error("This Map implementation only supports Number and String keys.");
                }
                this._keys[property] = key;
                this._values[property] = value;
                return this;
            };
            /**
             * @param {K} key
             * @return {boolean} true if the key was present before being deleted, false otherwise
             */
            SimpleMap.prototype.delete = function(key) {
                var property = this._keyToProperty(key);
                if (property === null) {
                    return false;
                }
                var result = property in this._keys;
                if (result) {
                    delete this._keys[property];
                    delete this._values[property];
                }
                return result;
            };
            /**
             */
            SimpleMap.prototype.clear = function() {
                this._keys = Object.create(null);
                this._values = Object.create(null);
            };
            /**
             * @param {function(V, K, libjass.Map.<K, V>)} callbackfn A function that is called with each key and value in the map.
             */
            SimpleMap.prototype.forEach = function(callbackfn, thisArg) {
                var keysArray = Object.keys(this._keys);
                for (var i = 0; i < keysArray.length; i++) {
                    var property = keysArray[i];
                    callbackfn.call(thisArg, this._values[property], this._keys[property], this);
                }
            };
            Object.defineProperty(SimpleMap.prototype, "size", {
                get: function() {
                    throw new Error("This Map implementation doesn't support size.");
                },
                enumerable: true,
                configurable: true
            });
            SimpleMap.prototype._keyToProperty = function(key) {
                if (typeof key === "number") {
                    return "#" + key;
                }
                if (typeof key === "string") {
                    return "'" + key;
                }
                return null;
            };
            return SimpleMap;
        }();
        libjass.Map = null;
        // Use this browser's implementation of Map if it has one
        if (global.Map !== undefined && typeof global.Map.prototype.forEach === "function") {
            libjass.Map = global.Map;
        } else {
            libjass.Map = SimpleMap;
        }
    })(libjass || (libjass = {}));
    (function(libjass) {
        (function(parts) {
            /**
             * Represents a CSS color with red, green, blue and alpha components.
             *
             * Instances of this class are immutable.
             *
             * @constructor
             * @param {number} red
             * @param {number} green
             * @param {number} blue
             * @param {number=1} alpha
             *
             * @memberof libjass.parts
             */
            var Color = function() {
                function Color(red, green, blue, alpha) {
                    if (typeof alpha === "undefined") {
                        alpha = 1;
                    }
                    this._red = red;
                    this._green = green;
                    this._blue = blue;
                    this._alpha = alpha;
                }
                Object.defineProperty(Color.prototype, "red", {
                    /**
                     * The red component of this color as a number between 0 and 255.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._red;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Color.prototype, "green", {
                    /**
                     * The green component of this color as a number between 0 and 255.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._green;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Color.prototype, "blue", {
                    /**
                     * The blue component of this color as a number between 0 and 255.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._blue;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Color.prototype, "alpha", {
                    /**
                     * The alpha component of this color as a number between 0 and 1, where 0 means transparent and 1 means opaque.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._alpha;
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * @param {?number} value The new alpha. If null, the existing alpha is used.
                 * @return {!libjass.parts.Color} Returns a new Color instance with the same color but the provided alpha.
                 */
                Color.prototype.withAlpha = function(value) {
                    if (value !== null) {
                        return new Color(this._red, this._green, this._blue, value);
                    }
                    return this;
                };
                /**
                 * @return {string} The CSS representation "rgba(...)" of this color.
                 */
                Color.prototype.toString = function() {
                    return "rgba(" + this._red + ", " + this._green + ", " + this._blue + ", " + this._alpha + ")";
                };
                return Color;
            }();
            parts.Color = Color;
            /**
             * A comment, i.e., any text enclosed in {} that is not understood as an ASS tag.
             *
             * @constructor
             * @param {string} value The text of this comment
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var Comment = function() {
                function Comment(value) {
                    this._value = value;
                }
                Object.defineProperty(Comment.prototype, "value", {
                    /**
                     * The value of this comment.
                     *
                     * @type {string}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return Comment;
            }();
            parts.Comment = Comment;
            /**
             * A block of text, i.e., any text not enclosed in {}. Also includes \h and \N.
             *
             * @constructor
             * @param {string} value The content of this block of text
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var Text = function() {
                function Text(value) {
                    this._value = value;
                }
                Object.defineProperty(Text.prototype, "value", {
                    /**
                     * The value of this text part.
                     *
                     * @type {string}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Text.prototype.toString = function() {
                    return "Text { value: " + this._value.replace(/\u00A0/g, "\\h").replace(/\n/g, "\\N") + " }";
                };
                return Text;
            }();
            parts.Text = Text;
            /**
             * An italic tag {\i}
             *
             * @constructor
             * @param {?boolean} value {\i1} -> true, {\i0} -> false, {\i} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var Italic = function() {
                function Italic(value) {
                    this._value = value;
                }
                Object.defineProperty(Italic.prototype, "value", {
                    /**
                     * The value of this italic tag.
                     *
                     * @type {?boolean}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return Italic;
            }();
            parts.Italic = Italic;
            /**
             * A bold tag {\b}
             *
             * @constructor
             * @param {*} value {\b1} -> true, {\b0} -> false, {\b###} -> weight of the bold (number), {\b} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var Bold = function() {
                function Bold(value) {
                    this._value = value;
                }
                Object.defineProperty(Bold.prototype, "value", {
                    /**
                     * The value of this bold tag.
                     *
                     * @type {?boolean|?number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return Bold;
            }();
            parts.Bold = Bold;
            /**
             * An underline tag {\u}
             *
             * @constructor
             * @param {?boolean} value {\u1} -> true, {\u0} -> false, {\u} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var Underline = function() {
                function Underline(value) {
                    this._value = value;
                }
                Object.defineProperty(Underline.prototype, "value", {
                    /**
                     * The value of this underline tag.
                     *
                     * @type {?boolean}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return Underline;
            }();
            parts.Underline = Underline;
            /**
             * A strike-through tag {\s}
             *
             * @constructor
             * @param {?boolean} value {\s1} -> true, {\s0} -> false, {\s} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var StrikeThrough = function() {
                function StrikeThrough(value) {
                    this._value = value;
                }
                Object.defineProperty(StrikeThrough.prototype, "value", {
                    /**
                     * The value of this strike-through tag.
                     *
                     * @type {?boolean}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return StrikeThrough;
            }();
            parts.StrikeThrough = StrikeThrough;
            /**
             * A border tag {\bord}
             *
             * @constructor
             * @param {?number} value {\bord###} -> width (number), {\bord} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var Border = function() {
                function Border(value) {
                    this._value = value;
                }
                Object.defineProperty(Border.prototype, "value", {
                    /**
                     * The value of this border tag.
                     *
                     * @type {?number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return Border;
            }();
            parts.Border = Border;
            /**
             * A horizontal border tag {\xbord}
             *
             * @constructor
             * @param {?number} value {\xbord###} -> width (number), {\xbord} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var BorderX = function() {
                function BorderX(value) {
                    this._value = value;
                }
                Object.defineProperty(BorderX.prototype, "value", {
                    /**
                     * The value of this horizontal border tag.
                     *
                     * @type {?number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return BorderX;
            }();
            parts.BorderX = BorderX;
            /**
             * A vertical border tag {\ybord}
             *
             * @constructor
             * @param {?number} value {\ybord###} -> height (number), {\ybord} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var BorderY = function() {
                function BorderY(value) {
                    this._value = value;
                }
                Object.defineProperty(BorderY.prototype, "value", {
                    /**
                     * The value of this vertical border tag.
                     *
                     * @type {?number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return BorderY;
            }();
            parts.BorderY = BorderY;
            /**
             * A shadow tag {\shad}
             *
             * @constructor
             * @param {?number} value {\shad###} -> depth (number), {\shad} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var Shadow = function() {
                function Shadow(value) {
                    this._value = value;
                }
                Object.defineProperty(Shadow.prototype, "value", {
                    /**
                     * The value of this shadow tag.
                     *
                     * @type {?number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return Shadow;
            }();
            parts.Shadow = Shadow;
            /**
             * A horizontal shadow tag {\xshad}
             *
             * @constructor
             * @param {?number} value {\xshad###} -> depth (number), {\xshad} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var ShadowX = function() {
                function ShadowX(value) {
                    this._value = value;
                }
                Object.defineProperty(ShadowX.prototype, "value", {
                    /**
                     * The value of this horizontal shadow tag.
                     *
                     * @type {?number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return ShadowX;
            }();
            parts.ShadowX = ShadowX;
            /**
             * A vertical shadow tag {\yshad}
             *
             * @constructor
             * @param {?number} value {\yshad###} -> depth (number), {\yshad} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var ShadowY = function() {
                function ShadowY(value) {
                    this._value = value;
                }
                Object.defineProperty(ShadowY.prototype, "value", {
                    /**
                     * The value of this vertical shadow tag.
                     *
                     * @type {?number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return ShadowY;
            }();
            parts.ShadowY = ShadowY;
            /**
             * A blur tag {\be}
             *
             * @constructor
             * @param {?number} value {\be###} -> strength (number), {\be} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var Blur = function() {
                function Blur(value) {
                    this._value = value;
                }
                Object.defineProperty(Blur.prototype, "value", {
                    /**
                     * The value of this blur tag.
                     *
                     * @type {?number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return Blur;
            }();
            parts.Blur = Blur;
            /**
             * A Gaussian blur tag {\blur}
             *
             * @constructor
             * @param {?number} value {\blur###} -> strength (number), {\blur} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var GaussianBlur = function() {
                function GaussianBlur(value) {
                    this._value = value;
                }
                Object.defineProperty(GaussianBlur.prototype, "value", {
                    /**
                     * The value of this Gaussian blur tag.
                     *
                     * @type {?number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return GaussianBlur;
            }();
            parts.GaussianBlur = GaussianBlur;
            /**
             * A font name tag {\fn}
             *
             * @constructor
             * @param {?string} value {\fn###} -> name (string), {\fn} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var FontName = function() {
                function FontName(value) {
                    this._value = value;
                }
                Object.defineProperty(FontName.prototype, "value", {
                    /**
                     * The value of this font name tag.
                     *
                     * @type {?string}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return FontName;
            }();
            parts.FontName = FontName;
            /**
             * A font size tag {\fs}
             *
             * @constructor
             * @param {?number} value {\fs###} -> size (number), {\fs} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var FontSize = function() {
                function FontSize(value) {
                    this._value = value;
                }
                Object.defineProperty(FontSize.prototype, "value", {
                    /**
                     * The value of this font size tag.
                     *
                     * @type {?number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return FontSize;
            }();
            parts.FontSize = FontSize;
            /**
             * A horizontal font scaling tag {\fscx}
             *
             * @constructor
             * @param {?number} value {\fscx###} -> scale (number), {\fscx} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var FontScaleX = function() {
                function FontScaleX(value) {
                    this._value = value;
                }
                Object.defineProperty(FontScaleX.prototype, "value", {
                    /**
                     * The value of this horizontal font scaling tag.
                     *
                     * @type {?number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return FontScaleX;
            }();
            parts.FontScaleX = FontScaleX;
            /**
             * A vertical font scaling tag {\fscy}
             *
             * @constructor
             * @param {?number} value {\fscy###} -> scale (number), {\fscy} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var FontScaleY = function() {
                function FontScaleY(value) {
                    this._value = value;
                }
                Object.defineProperty(FontScaleY.prototype, "value", {
                    /**
                     * The value of this vertical font scaling tag.
                     *
                     * @type {?number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return FontScaleY;
            }();
            parts.FontScaleY = FontScaleY;
            /**
             * A letter-spacing tag {\fsp}
             *
             * @constructor
             * @param {?number} value {\fsp###} -> spacing (number), {\fsp} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var LetterSpacing = function() {
                function LetterSpacing(value) {
                    this._value = value;
                }
                Object.defineProperty(LetterSpacing.prototype, "value", {
                    /**
                     * The value of this letter-spacing tag.
                     *
                     * @type {?number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return LetterSpacing;
            }();
            parts.LetterSpacing = LetterSpacing;
            /**
             * An X-axis rotation tag {\frx}
             *
             * @constructor
             * @param {?number} value {\frx###} -> angle (number), {\frx} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var RotateX = function() {
                function RotateX(value) {
                    this._value = value;
                }
                Object.defineProperty(RotateX.prototype, "value", {
                    /**
                     * The value of this X-axis rotation tag.
                     *
                     * @type {?number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return RotateX;
            }();
            parts.RotateX = RotateX;
            /**
             * A Y-axis rotation tag {\fry}
             *
             * @constructor
             * @param {?number} value {\fry###} -> angle (number), {\fry} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var RotateY = function() {
                function RotateY(value) {
                    this._value = value;
                }
                Object.defineProperty(RotateY.prototype, "value", {
                    /**
                     * The value of this Y-axis rotation tag.
                     *
                     * @type {?number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return RotateY;
            }();
            parts.RotateY = RotateY;
            /**
             * A Z-axis rotation tag {\fr} or {\frz}
             *
             * @constructor
             * @param {?number} value {\frz###} -> angle (number), {\frz} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var RotateZ = function() {
                function RotateZ(value) {
                    this._value = value;
                }
                Object.defineProperty(RotateZ.prototype, "value", {
                    /**
                     * The value of this Z-axis rotation tag.
                     *
                     * @type {?number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return RotateZ;
            }();
            parts.RotateZ = RotateZ;
            /**
             * An X-axis shearing tag {\fax}
             *
             * @constructor
             * @param {?number} value {\fax###} -> angle (number), {\fax} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var SkewX = function() {
                function SkewX(value) {
                    this._value = value;
                }
                Object.defineProperty(SkewX.prototype, "value", {
                    /**
                     * The value of this X-axis shearing tag.
                     *
                     * @type {?number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return SkewX;
            }();
            parts.SkewX = SkewX;
            /**
             * A Y-axis shearing tag {\fay}
             *
             * @constructor
             * @param {?number} value {\fay###} -> angle (number), {\fay} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var SkewY = function() {
                function SkewY(value) {
                    this._value = value;
                }
                Object.defineProperty(SkewY.prototype, "value", {
                    /**
                     * The value of this Y-axis shearing tag.
                     *
                     * @type {?number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return SkewY;
            }();
            parts.SkewY = SkewY;
            /**
             * A primary color tag {\c} or {\1c}
             *
             * @constructor
             * @param {libjass.parts.Color} value {\1c###} -> color (Color), {\1c} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var PrimaryColor = function() {
                function PrimaryColor(value) {
                    this._value = value;
                }
                Object.defineProperty(PrimaryColor.prototype, "value", {
                    /**
                     * The value of this primary color tag.
                     *
                     * @type {libjass.parts.Color}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return PrimaryColor;
            }();
            parts.PrimaryColor = PrimaryColor;
            /**
             * A secondary color tag {\2c}
             *
             * @constructor
             * @param {libjass.parts.Color} value {\2c###} -> color (Color), {\2c} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var SecondaryColor = function() {
                function SecondaryColor(value) {
                    this._value = value;
                }
                Object.defineProperty(SecondaryColor.prototype, "value", {
                    /**
                     * The value of this secondary color tag.
                     *
                     * @type {libjass.parts.Color}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return SecondaryColor;
            }();
            parts.SecondaryColor = SecondaryColor;
            /**
             * An outline color tag {\3c}
             *
             * @constructor
             * @param {libjass.parts.Color} value {\3c###} -> color (Color), {\3c} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var OutlineColor = function() {
                function OutlineColor(value) {
                    this._value = value;
                }
                Object.defineProperty(OutlineColor.prototype, "value", {
                    /**
                     * The value of this outline color tag.
                     *
                     * @type {libjass.parts.Color}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return OutlineColor;
            }();
            parts.OutlineColor = OutlineColor;
            /**
             * A shadow color tag {\4c}
             *
             * @constructor
             * @param {libjass.parts.Color} value {\4c###} -> color (Color), {\4c} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var ShadowColor = function() {
                function ShadowColor(value) {
                    this._value = value;
                }
                Object.defineProperty(ShadowColor.prototype, "value", {
                    /**
                     * The value of this shadow color tag.
                     *
                     * @type {libjass.parts.Color}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return ShadowColor;
            }();
            parts.ShadowColor = ShadowColor;
            /**
             * An alpha tag {\alpha}
             *
             * @constructor
             * @param {?number} value {\alpha###} -> alpha (number), {\alpha} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var Alpha = function() {
                function Alpha(value) {
                    this._value = value;
                }
                Object.defineProperty(Alpha.prototype, "value", {
                    /**
                     * The value of this alpha tag.
                     *
                     * @type {?number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return Alpha;
            }();
            parts.Alpha = Alpha;
            /**
             * A primary alpha tag {\1a}
             *
             * @constructor
             * @param {?number} value {\1a###} -> alpha (number), {\1a} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var PrimaryAlpha = function() {
                function PrimaryAlpha(value) {
                    this._value = value;
                }
                Object.defineProperty(PrimaryAlpha.prototype, "value", {
                    /**
                     * The value of this primary alpha tag.
                     *
                     * @type {?number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return PrimaryAlpha;
            }();
            parts.PrimaryAlpha = PrimaryAlpha;
            /**
             * A secondary alpha tag {\2a}
             *
             * @constructor
             * @param {?number} value {\2a###} -> alpha (number), {\2a} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var SecondaryAlpha = function() {
                function SecondaryAlpha(value) {
                    this._value = value;
                }
                Object.defineProperty(SecondaryAlpha.prototype, "value", {
                    /**
                     * The value of this secondary alpha tag.
                     *
                     * @type {?number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return SecondaryAlpha;
            }();
            parts.SecondaryAlpha = SecondaryAlpha;
            /**
             * An outline alpha tag {\3a}
             *
             * @constructor
             * @param {?number} value {\3a###} -> alpha (number), {\3a} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var OutlineAlpha = function() {
                function OutlineAlpha(value) {
                    this._value = value;
                }
                Object.defineProperty(OutlineAlpha.prototype, "value", {
                    /**
                     * The value of this outline alpha tag.
                     *
                     * @type {?number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return OutlineAlpha;
            }();
            parts.OutlineAlpha = OutlineAlpha;
            /**
             * A shadow alpha tag {\4a}
             *
             * @constructor
             * @param {?number} value {\4a###} -> alpha (number), {\4a} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var ShadowAlpha = function() {
                function ShadowAlpha(value) {
                    this._value = value;
                }
                Object.defineProperty(ShadowAlpha.prototype, "value", {
                    /**
                     * The value of this shadow alpha tag.
                     *
                     * @type {?number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return ShadowAlpha;
            }();
            parts.ShadowAlpha = ShadowAlpha;
            /**
             * An alignment tag {\an} or {\a}
             *
             * @constructor
             * @param {number} value {\an###} -> alignment (number)
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var Alignment = function() {
                function Alignment(value) {
                    this._value = value;
                }
                Object.defineProperty(Alignment.prototype, "value", {
                    /**
                     * The value of this alignment tag.
                     *
                     * @type {?number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return Alignment;
            }();
            parts.Alignment = Alignment;
            /**
             * A color karaoke tag {\k}
             *
             * @constructor
             * @param {number} duration {\k###} -> duration (number)
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var ColorKaraoke = function() {
                function ColorKaraoke(duration) {
                    this._duration = duration;
                }
                Object.defineProperty(ColorKaraoke.prototype, "duration", {
                    /**
                     * The duration of this color karaoke tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._duration;
                    },
                    enumerable: true,
                    configurable: true
                });
                return ColorKaraoke;
            }();
            parts.ColorKaraoke = ColorKaraoke;
            /**
             * A sweeping color karaoke tag {\K} or {\kf}
             *
             * @constructor
             * @param {number} duration {\kf###} -> duration (number)
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var SweepingColorKaraoke = function() {
                function SweepingColorKaraoke(duration) {
                    this._duration = duration;
                }
                Object.defineProperty(SweepingColorKaraoke.prototype, "duration", {
                    /**
                     * The duration of this sweeping color karaoke tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._duration;
                    },
                    enumerable: true,
                    configurable: true
                });
                return SweepingColorKaraoke;
            }();
            parts.SweepingColorKaraoke = SweepingColorKaraoke;
            /**
             * An outline karaoke tag {\ko}
             *
             * @constructor
             * @param {number} duration {\ko###} -> duration (number)
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var OutlineKaraoke = function() {
                function OutlineKaraoke(duration) {
                    this._duration = duration;
                }
                Object.defineProperty(OutlineKaraoke.prototype, "duration", {
                    /**
                     * The duration of this outline karaoke tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._duration;
                    },
                    enumerable: true,
                    configurable: true
                });
                return OutlineKaraoke;
            }();
            parts.OutlineKaraoke = OutlineKaraoke;
            /**
             * A wrapping style tag {\q}
             *
             * @constructor
             * @param {number} value {\q###} -> style (number)
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var WrappingStyle = function() {
                function WrappingStyle(value) {
                    this._value = value;
                }
                Object.defineProperty(WrappingStyle.prototype, "value", {
                    /**
                     * The value of this wrapping style tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return WrappingStyle;
            }();
            parts.WrappingStyle = WrappingStyle;
            /**
             * A style reset tag {\r}
             *
             * @constructor
             * @param {?string} value {\r###} -> style name (string), {\r} -> null
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var Reset = function() {
                function Reset(value) {
                    this._value = value;
                }
                Object.defineProperty(Reset.prototype, "value", {
                    /**
                     * The value of this style reset tag.
                     *
                     * @type {?string}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return Reset;
            }();
            parts.Reset = Reset;
            /**
             * A position tag {\pos}
             *
             * @constructor
             * @param {number} x
             * @param {number} y
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var Position = function() {
                function Position(x, y) {
                    this._x = x;
                    this._y = y;
                }
                Object.defineProperty(Position.prototype, "x", {
                    /**
                     * The x value of this position tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._x;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Position.prototype, "y", {
                    /**
                     * The y value of this position tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._y;
                    },
                    enumerable: true,
                    configurable: true
                });
                return Position;
            }();
            parts.Position = Position;
            /**
             * A movement tag {\move}
             *
             * @constructor
             * @param {number} x1
             * @param {number} y1
             * @param {number} x2
             * @param {number} y2
             * @param {number} t1
             * @param {number} t2
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var Move = function() {
                function Move(x1, y1, x2, y2, t1, t2) {
                    this._x1 = x1;
                    this._y1 = y1;
                    this._x2 = x2;
                    this._y2 = y2;
                    this._t1 = t1;
                    this._t2 = t2;
                }
                Object.defineProperty(Move.prototype, "x1", {
                    /**
                     * The starting x value of this move tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._x1;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Move.prototype, "y1", {
                    /**
                     * The starting y value of this move tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._y1;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Move.prototype, "x2", {
                    /**
                     * The ending x value of this move tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._x2;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Move.prototype, "y2", {
                    /**
                     * The ending y value of this move tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._y2;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Move.prototype, "t1", {
                    /**
                     * The start time of this move tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._t1;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Move.prototype, "t2", {
                    /**
                     * The end time value of this move tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._t2;
                    },
                    enumerable: true,
                    configurable: true
                });
                return Move;
            }();
            parts.Move = Move;
            /**
             * A rotation origin tag {\org}
             *
             * @constructor
             * @param {number} x
             * @param {number} y
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var RotationOrigin = function() {
                function RotationOrigin(x, y) {
                    this._x = x;
                    this._y = y;
                }
                Object.defineProperty(RotationOrigin.prototype, "x", {
                    /**
                     * The x value of this rotation origin tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._x;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RotationOrigin.prototype, "y", {
                    /**
                     * The y value of this rotation origin tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._y;
                    },
                    enumerable: true,
                    configurable: true
                });
                return RotationOrigin;
            }();
            parts.RotationOrigin = RotationOrigin;
            /**
             * A simple fade tag {\fad}
             *
             * @constructor
             * @param {number} start
             * @param {number} end
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var Fade = function() {
                function Fade(start, end) {
                    this._start = start;
                    this._end = end;
                }
                Object.defineProperty(Fade.prototype, "start", {
                    /**
                     * The start time of this fade tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._start;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Fade.prototype, "end", {
                    /**
                     * The end time of this fade tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._end;
                    },
                    enumerable: true,
                    configurable: true
                });
                return Fade;
            }();
            parts.Fade = Fade;
            /**
             * A complex fade tag {\fade}
             *
             * @constructor
             * @param {number} a1
             * @param {number} a2
             * @param {number} a3
             * @param {number} t1
             * @param {number} t2
             * @param {number} t3
             * @param {number} t4
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var ComplexFade = function() {
                function ComplexFade(a1, a2, a3, t1, t2, t3, t4) {
                    this._a1 = a1;
                    this._a2 = a2;
                    this._a3 = a3;
                    this._t1 = t1;
                    this._t2 = t2;
                    this._t3 = t3;
                    this._t4 = t4;
                }
                Object.defineProperty(ComplexFade.prototype, "a1", {
                    /**
                     * The alpha value of this complex fade tag at time t2.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._a1;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ComplexFade.prototype, "a2", {
                    /**
                     * The alpha value of this complex fade tag at time t3.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._a2;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ComplexFade.prototype, "a3", {
                    /**
                     * The alpha value of this complex fade tag at time t4.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._a3;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ComplexFade.prototype, "t1", {
                    /**
                     * The starting time of this complex fade tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._t1;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ComplexFade.prototype, "t2", {
                    /**
                     * The first intermediate time of this complex fade tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._t2;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ComplexFade.prototype, "t3", {
                    /**
                     * The second intermediate time of this complex fade tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._t3;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ComplexFade.prototype, "t4", {
                    /**
                     * The ending time of this complex fade tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._t4;
                    },
                    enumerable: true,
                    configurable: true
                });
                return ComplexFade;
            }();
            parts.ComplexFade = ComplexFade;
            /**
             * A transform tag {\t}
             *
             * @constructor
             * @param {number} start
             * @param {number} end
             * @param {number} accel
             * @param {!Array.<!libjass.parts.Tag>} tags
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var Transform = function() {
                function Transform(start, end, accel, tags) {
                    this._start = start;
                    this._end = end;
                    this._accel = accel;
                    this._tags = tags;
                }
                Object.defineProperty(Transform.prototype, "start", {
                    /**
                     * The starting time of this transform tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._start;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Transform.prototype, "end", {
                    /**
                     * The ending time of this transform tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._end;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Transform.prototype, "accel", {
                    /**
                     * The acceleration of this transform tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._accel;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Transform.prototype, "tags", {
                    /**
                     * The tags animated by this transform tag.
                     *
                     * @type {!Array.<!libjass.parts.Tag>}
                     */
                    get: function() {
                        return this._tags;
                    },
                    enumerable: true,
                    configurable: true
                });
                return Transform;
            }();
            parts.Transform = Transform;
            /**
             * A rectangular clip tag {\clip} or {\iclip}
             *
             * @constructor
             * @param {number} x1
             * @param {number} y1
             * @param {number} x2
             * @param {number} y2
             * @param {boolean} inside
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var RectangularClip = function() {
                function RectangularClip(x1, y1, x2, y2, inside) {
                    this._x1 = x1;
                    this._y1 = y1;
                    this._x2 = x2;
                    this._y2 = y2;
                    this._inside = inside;
                }
                Object.defineProperty(RectangularClip.prototype, "x1", {
                    /**
                     * The X coordinate of the starting position of this rectangular clip tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._x1;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RectangularClip.prototype, "y1", {
                    /**
                     * The Y coordinate of the starting position of this rectangular clip tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._y1;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RectangularClip.prototype, "x2", {
                    /**
                     * The X coordinate of the ending position of this rectangular clip tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._x2;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RectangularClip.prototype, "y2", {
                    /**
                     * The Y coordinate of the ending position of this rectangular clip tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._y2;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RectangularClip.prototype, "inside", {
                    /**
                     * Whether this rectangular clip tag clips the region it encloses or the region it excludes.
                     *
                     * @type {boolean}
                     */
                    get: function() {
                        return this._inside;
                    },
                    enumerable: true,
                    configurable: true
                });
                return RectangularClip;
            }();
            parts.RectangularClip = RectangularClip;
            /**
             * A vector clip tag {\clip} or {\iclip}
             *
             * @constructor
             * @param {number} scale
             * @param {!Array.<!libjass.parts.drawing.Instruction>} instructions
             * @param {boolean} inside
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var VectorClip = function() {
                function VectorClip(scale, instructions, inside) {
                    this._scale = scale;
                    this._instructions = instructions;
                    this._inside = inside;
                }
                Object.defineProperty(VectorClip.prototype, "scale", {
                    /**
                     * The scale of this vector clip tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._scale;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(VectorClip.prototype, "instructions", {
                    /**
                     * The clip commands of this vector clip tag.
                     *
                     * @type {string}
                     */
                    get: function() {
                        return this._instructions;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(VectorClip.prototype, "inside", {
                    /**
                     * Whether this vector clip tag clips the region it encloses or the region it excludes.
                     *
                     * @type {boolean}
                     */
                    get: function() {
                        return this._inside;
                    },
                    enumerable: true,
                    configurable: true
                });
                return VectorClip;
            }();
            parts.VectorClip = VectorClip;
            /**
             * A drawing mode tag {\p}
             *
             * @constructor
             * @param {number} scale
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var DrawingMode = function() {
                function DrawingMode(scale) {
                    this._scale = scale;
                }
                Object.defineProperty(DrawingMode.prototype, "scale", {
                    /**
                     * The scale of this drawing mode tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._scale;
                    },
                    enumerable: true,
                    configurable: true
                });
                return DrawingMode;
            }();
            parts.DrawingMode = DrawingMode;
            /**
             * A drawing mode baseline offset tag {\pbo}
             *
             * @constructor
             * @param {number} value
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var DrawingBaselineOffset = function() {
                function DrawingBaselineOffset(value) {
                    this._value = value;
                }
                Object.defineProperty(DrawingBaselineOffset.prototype, "value", {
                    /**
                     * The value of this drawing mode baseline offset tag.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return DrawingBaselineOffset;
            }();
            parts.DrawingBaselineOffset = DrawingBaselineOffset;
            /**
             * A pseudo-part representing text interpreted as drawing instructions
             *
             * @constructor
             * @param {!Array.<!libjass.parts.drawing.Instruction>} instructions
             *
             * @extends {libjass.parts.PartBase}
             * @memberof libjass.parts
             */
            var DrawingInstructions = function() {
                function DrawingInstructions(instructions) {
                    this._instructions = instructions;
                }
                Object.defineProperty(DrawingInstructions.prototype, "instructions", {
                    /**
                     * The instructions contained in this drawing instructions part.
                     *
                     * @type {!Array.<!libjass.parts.drawing.Instruction>}
                     */
                    get: function() {
                        return this._instructions;
                    },
                    enumerable: true,
                    configurable: true
                });
                return DrawingInstructions;
            }();
            parts.DrawingInstructions = DrawingInstructions;
            (function(drawing) {
                /**
                 * An instruction to move to a particular position.
                 *
                 * @constructor
                 * @param {number} x
                 * @param {number} y
                 *
                 * @extends {libjass.parts.PartBase}
                 * @memberof libjass.parts.drawing
                 */
                var MoveInstruction = function() {
                    function MoveInstruction(x, y) {
                        this._x = x;
                        this._y = y;
                    }
                    Object.defineProperty(MoveInstruction.prototype, "x", {
                        /**
                         * The X position of this move instruction.
                         *
                         * @type {number}
                         */
                        get: function() {
                            return this._x;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(MoveInstruction.prototype, "y", {
                        /**
                         * The Y position of this move instruction.
                         *
                         * @type {number}
                         */
                        get: function() {
                            return this._y;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    return MoveInstruction;
                }();
                drawing.MoveInstruction = MoveInstruction;
                /**
                 * An instruction to draw a line to a particular position.
                 *
                 * @constructor
                 * @param {number} x
                 * @param {number} y
                 *
                 * @extends {libjass.parts.PartBase}
                 * @memberof libjass.parts.drawing
                 */
                var LineInstruction = function() {
                    function LineInstruction(x, y) {
                        this._x = x;
                        this._y = y;
                    }
                    Object.defineProperty(LineInstruction.prototype, "x", {
                        /**
                         * The X position of this line instruction.
                         *
                         * @type {number}
                         */
                        get: function() {
                            return this._x;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(LineInstruction.prototype, "y", {
                        /**
                         * The Y position of this line instruction.
                         *
                         * @type {number}
                         */
                        get: function() {
                            return this._y;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    return LineInstruction;
                }();
                drawing.LineInstruction = LineInstruction;
                /**
                 * An instruction to draw a cubic bezier curve to a particular position, with two given control points.
                 *
                 * @constructor
                 * @param {number} x1
                 * @param {number} y1
                 * @param {number} x2
                 * @param {number} y2
                 * @param {number} x3
                 * @param {number} y3
                 *
                 * @extends {libjass.parts.PartBase}
                 * @memberof libjass.parts.drawing
                 */
                var CubicBezierCurveInstruction = function() {
                    function CubicBezierCurveInstruction(x1, y1, x2, y2, x3, y3) {
                        this._x1 = x1;
                        this._y1 = y1;
                        this._x2 = x2;
                        this._y2 = y2;
                        this._x3 = x3;
                        this._y3 = y3;
                    }
                    Object.defineProperty(CubicBezierCurveInstruction.prototype, "x1", {
                        /**
                         * The X position of the first control point of this cubic bezier curve instruction.
                         *
                         * @type {number}
                         */
                        get: function() {
                            return this._x1;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(CubicBezierCurveInstruction.prototype, "y1", {
                        /**
                         * The Y position of the first control point of this cubic bezier curve instruction.
                         *
                         * @type {number}
                         */
                        get: function() {
                            return this._y1;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(CubicBezierCurveInstruction.prototype, "x2", {
                        /**
                         * The X position of the second control point of this cubic bezier curve instruction.
                         *
                         * @type {number}
                         */
                        get: function() {
                            return this._x2;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(CubicBezierCurveInstruction.prototype, "y2", {
                        /**
                         * The Y position of the second control point of this cubic bezier curve instruction.
                         *
                         * @type {number}
                         */
                        get: function() {
                            return this._y2;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(CubicBezierCurveInstruction.prototype, "x3", {
                        /**
                         * The ending X position of this cubic bezier curve instruction.
                         *
                         * @type {number}
                         */
                        get: function() {
                            return this._x3;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(CubicBezierCurveInstruction.prototype, "y3", {
                        /**
                         * The ending Y position of this cubic bezier curve instruction.
                         *
                         * @type {number}
                         */
                        get: function() {
                            return this._y3;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    return CubicBezierCurveInstruction;
                }();
                drawing.CubicBezierCurveInstruction = CubicBezierCurveInstruction;
            })(parts.drawing || (parts.drawing = {}));
            var addToString = function(ctor, ctorName) {
                if (!ctor.prototype.hasOwnProperty("toString")) {
                    var propertyNames = Object.getOwnPropertyNames(ctor.prototype).filter(function(property) {
                        return property !== "constructor";
                    });
                    ctor.prototype.toString = function() {
                        var _this = this;
                        return ctorName + " { " + propertyNames.map(function(name) {
                            return name + ": " + _this[name];
                        }).join(", ") + (propertyNames.length > 0 ? " " : "") + "}";
                    };
                }
            };
            Object.keys(libjass.parts).forEach(function(key) {
                var value = libjass.parts[key];
                if (value instanceof Function) {
                    addToString(value, key);
                }
            });
            Object.keys(libjass.parts.drawing).forEach(function(key) {
                var value = libjass.parts.drawing[key];
                if (value instanceof Function) {
                    addToString(value, "Drawing" + key);
                }
            });
        })(libjass.parts || (libjass.parts = {}));
    })(libjass || (libjass = {}));
    (function(libjass) {
        (function(parser) {
            /**
             * Parses a given string with the specified rule.
             *
             * @param {string} input
             * @param {string} rule
             * @return {*}
             *
             * @memberof libjass.parser
             */
            function parse(input, rule) {
                var run = new ParserRun(input, rule);
                if (run.result === null || run.result.end !== input.length) {
                    throw new Error("Parse failed.");
                }
                return run.result.value;
            }
            parser.parse = parse;
            /**
             * This class represents a single run of the parser.
             *
             * @constructor
             *
             * @param {string} input
             * @param {string} rule
             *
             * @private
             * @memberof libjass.parser
             */
            var ParserRun = function() {
                function ParserRun(input, rule) {
                    this._input = input;
                    this._parseTree = new ParseNode(null);
                    this._result = rules.get(rule).call(this, this._parseTree);
                }
                Object.defineProperty(ParserRun.prototype, "result", {
                    /**
                     * @type {!ParseNode}
                     */
                    get: function() {
                        return this._result;
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_script = function(parent) {
                    var current = new ParseNode(parent);
                    current.value = Object.create(null);
                    while (this._haveMore()) {
                        var scriptSectionNode = this.parse_scriptSection(current);
                        if (scriptSectionNode !== null) {
                            current.value[scriptSectionNode.value.name] = scriptSectionNode.value.contents;
                        } else if (this.read(current, "\n") === null) {
                            parent.pop();
                            return null;
                        }
                    }
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_scriptSection = function(parent) {
                    var current = new ParseNode(parent);
                    current.value = Object.create(null);
                    current.value.contents = null;
                    var sectionHeaderNode = this.parse_scriptSectionHeader(current);
                    if (sectionHeaderNode === null) {
                        parent.pop();
                        return null;
                    }
                    current.value.name = sectionHeaderNode.value;
                    var formatSpecifier = null;
                    while (this._haveMore() && this._peek() !== "[") {
                        if (this.parse_scriptComment(current) !== null) {
                            continue;
                        }
                        var propertyNode = this.parse_scriptProperty(current);
                        if (propertyNode !== null) {
                            var property = propertyNode.value;
                            if (property.key === "Format") {
                                formatSpecifier = property.value.split(",").map(function(formatPart) {
                                    return formatPart.trim();
                                });
                            } else if (formatSpecifier !== null) {
                                if (current.value.contents === null) {
                                    current.value.contents = [];
                                }
                                var template = Object.create(null);
                                var value = property.value.split(",");
                                if (value.length > formatSpecifier.length) {
                                    value[formatSpecifier.length - 1] = value.slice(formatSpecifier.length - 1).join(",");
                                }
                                formatSpecifier.forEach(function(formatKey, index) {
                                    template[formatKey] = value[index];
                                });
                                current.value.contents.push({
                                    type: property.key,
                                    template: template
                                });
                            } else {
                                if (current.value.contents === null) {
                                    current.value.contents = Object.create(null);
                                }
                                current.value.contents[property.key] = property.value;
                            }
                        } else if (this.read(current, "\n") === null) {
                            parent.pop();
                            return null;
                        }
                    }
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_scriptSectionHeader = function(parent) {
                    var current = new ParseNode(parent);
                    if (this.read(current, "[") === null) {
                        parent.pop();
                        return null;
                    }
                    var nameNode = new ParseNode(current, "");
                    for (var next = this._peek(); this._haveMore() && next !== "]" && next !== "\n"; next = this._peek()) {
                        nameNode.value += next;
                    }
                    if (nameNode.value.length === 0) {
                        parent.pop();
                        return null;
                    }
                    current.value = nameNode.value;
                    if (this.read(current, "]") === null) {
                        parent.pop();
                        return null;
                    }
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_scriptProperty = function(parent) {
                    var current = new ParseNode(parent);
                    current.value = Object.create(null);
                    var keyNode = new ParseNode(current, "");
                    var next;
                    for (next = this._peek(); this._haveMore() && next !== ":" && next !== "\n"; next = this._peek()) {
                        keyNode.value += next;
                    }
                    if (keyNode.value.length === 0) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, ":") === null) {
                        parent.pop();
                        return null;
                    }
                    var spacesNode = new ParseNode(current, "");
                    for (next = this._peek(); next === " "; next = this._peek()) {
                        spacesNode.value += next;
                    }
                    var valueNode = new ParseNode(current, "");
                    for (next = this._peek(); this._haveMore() && next !== "\n"; next = this._peek()) {
                        valueNode.value += next;
                    }
                    current.value.key = keyNode.value;
                    current.value.value = valueNode.value;
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_scriptComment = function(parent) {
                    var current = new ParseNode(parent);
                    if (this.read(current, ";") === null) {
                        parent.pop();
                        return null;
                    }
                    var valueNode = new ParseNode(current, "");
                    for (var next = this._peek(); this._haveMore() && next !== "\n"; next = this._peek()) {
                        valueNode.value += next;
                    }
                    current.value = valueNode.value;
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_dialogueParts = function(parent) {
                    var current = new ParseNode(parent);
                    current.value = [];
                    while (this._haveMore()) {
                        var enclosedTagsNode = this.parse_enclosedTags(current);
                        if (enclosedTagsNode !== null) {
                            current.value.push.apply(current.value, enclosedTagsNode.value);
                        } else {
                            var textNode = this.parse_newline(current) || this.parse_hardspace(current) || this.parse_text(current);
                            if (textNode !== null) {
                                if (current.value[current.value.length - 1] instanceof libjass.parts.Text) {
                                    // Merge consecutive text parts into one part
                                    current.value[current.value.length - 1] = new libjass.parts.Text(current.value[current.value.length - 1].value + textNode.value.value);
                                } else {
                                    current.value.push(textNode.value);
                                }
                            } else {
                                parent.pop();
                                return null;
                            }
                        }
                    }
                    var inDrawingMode = false;
                    current.value.forEach(function(part, i) {
                        if (part instanceof libjass.parts.DrawingMode) {
                            inDrawingMode = part.scale !== 0;
                        } else if (part instanceof libjass.parts.Text && inDrawingMode) {
                            current.value[i] = new libjass.parts.DrawingInstructions(parser.parse(part.value, "drawingInstructions"));
                        }
                    });
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_enclosedTags = function(parent) {
                    var current = new ParseNode(parent);
                    current.value = [];
                    if (this.read(current, "{") === null) {
                        parent.pop();
                        return null;
                    }
                    for (var next = this._peek(); this._haveMore() && next !== "}"; next = this._peek()) {
                        var childNode = null;
                        if (this.read(current, "\\") !== null) {
                            childNode = this.parse_tag_alpha(current) || this.parse_tag_iclip(current) || this.parse_tag_xbord(current) || this.parse_tag_ybord(current) || this.parse_tag_xshad(current) || this.parse_tag_yshad(current) || this.parse_tag_blur(current) || this.parse_tag_bord(current) || this.parse_tag_clip(current) || this.parse_tag_fade(current) || this.parse_tag_fscx(current) || this.parse_tag_fscy(current) || this.parse_tag_move(current) || this.parse_tag_shad(current) || this.parse_tag_fad(current) || this.parse_tag_fax(current) || this.parse_tag_fay(current) || this.parse_tag_frx(current) || this.parse_tag_fry(current) || this.parse_tag_frz(current) || this.parse_tag_fsp(current) || this.parse_tag_org(current) || this.parse_tag_pbo(current) || this.parse_tag_pos(current) || this.parse_tag_an(current) || this.parse_tag_be(current) || this.parse_tag_fn(current) || this.parse_tag_fr(current) || this.parse_tag_fs(current) || this.parse_tag_kf(current) || this.parse_tag_ko(current) || this.parse_tag_1a(current) || this.parse_tag_1c(current) || this.parse_tag_2a(current) || this.parse_tag_2c(current) || this.parse_tag_3a(current) || this.parse_tag_3c(current) || this.parse_tag_4a(current) || this.parse_tag_4c(current) || this.parse_tag_a(current) || this.parse_tag_b(current) || this.parse_tag_c(current) || this.parse_tag_i(current) || this.parse_tag_k(current) || this.parse_tag_K(current) || this.parse_tag_p(current) || this.parse_tag_q(current) || this.parse_tag_r(current) || this.parse_tag_s(current) || this.parse_tag_t(current) || this.parse_tag_u(current);
                            if (childNode === null) {
                                current.pop();
                            }
                        }
                        if (childNode === null) {
                            childNode = this.parse_comment(current);
                        }
                        if (childNode !== null) {
                            if (childNode.value instanceof libjass.parts.Comment && current.value[current.value.length - 1] instanceof libjass.parts.Comment) {
                                // Merge consecutive comment parts into one part
                                current.value[current.value.length - 1] = new libjass.parts.Comment(current.value[current.value.length - 1].value + childNode.value.value);
                            } else {
                                current.value.push(childNode.value);
                            }
                        } else {
                            parent.pop();
                            return null;
                        }
                    }
                    if (this.read(current, "}") === null) {
                        parent.pop();
                        return null;
                    }
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_newline = function(parent) {
                    var current = new ParseNode(parent);
                    if (this.read(current, "\\N") === null) {
                        parent.pop();
                        return null;
                    }
                    current.value = new libjass.parts.Text("\n");
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_hardspace = function(parent) {
                    var current = new ParseNode(parent);
                    if (this.read(current, "\\h") === null) {
                        parent.pop();
                        return null;
                    }
                    current.value = new libjass.parts.Text(" ");
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_text = function(parent) {
                    var value = this._peek();
                    var current = new ParseNode(parent);
                    var valueNode = new ParseNode(current, value);
                    current.value = new libjass.parts.Text(valueNode.value);
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_comment = function(parent) {
                    var value = this._peek();
                    var current = new ParseNode(parent);
                    var valueNode = new ParseNode(current, value);
                    current.value = new libjass.parts.Comment(valueNode.value);
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_a = function(parent) {
                    var current = new ParseNode(parent);
                    if (this.read(current, "a") === null) {
                        parent.pop();
                        return null;
                    }
                    var next = this._peek();
                    switch (next) {
                      case "1":
                        var next2 = this._peek(2);
                        switch (next2) {
                          case "10":
                          case "11":
                            next = next2;
                            break;
                        }
                        break;

                      case "2":
                      case "3":
                      case "5":
                      case "6":
                      case "7":
                      case "9":
                        break;

                      default:
                        parent.pop();
                        return null;
                    }
                    var valueNode = new ParseNode(current, next);
                    var value = null;
                    switch (valueNode.value) {
                      case "1":
                        value = 1;
                        break;

                      case "2":
                        value = 2;
                        break;

                      case "3":
                        value = 3;
                        break;

                      case "5":
                        value = 7;
                        break;

                      case "6":
                        value = 8;
                        break;

                      case "7":
                        value = 9;
                        break;

                      case "9":
                        value = 4;
                        break;

                      case "10":
                        value = 5;
                        break;

                      case "11":
                        value = 6;
                        break;
                    }
                    current.value = new libjass.parts.Alignment(value);
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_alpha = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_an = function(parent) {
                    var current = new ParseNode(parent);
                    if (this.read(current, "an") === null) {
                        parent.pop();
                        return null;
                    }
                    var next = this._peek();
                    if (next < "1" || next > "9") {
                        parent.pop();
                        return null;
                    }
                    var valueNode = new ParseNode(current, next);
                    current.value = new libjass.parts.Alignment(parseInt(valueNode.value));
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_b = function(parent) {
                    var current = new ParseNode(parent);
                    if (this.read(current, "b") === null) {
                        parent.pop();
                        return null;
                    }
                    var valueNode = null;
                    var next = this._peek();
                    if (next >= "1" && next <= "9") {
                        next = this._peek(3);
                        if (next.substr(1) === "00") {
                            valueNode = new ParseNode(current, next);
                            valueNode.value = parseInt(valueNode.value);
                        }
                    }
                    if (valueNode === null) {
                        valueNode = this.parse_enableDisable(current);
                    }
                    if (valueNode !== null) {
                        current.value = new libjass.parts.Bold(valueNode.value);
                    } else {
                        current.value = new libjass.parts.Bold(null);
                    }
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_be = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_blur = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_bord = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_c = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_clip = function(parent) {
                    return this._parse_tag_clip_or_iclip("clip", parent);
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_fad = function(parent) {
                    var current = new ParseNode(parent);
                    if (this.read(current, "fad") === null) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, "(") === null) {
                        parent.pop();
                        return null;
                    }
                    var startNode = this.parse_decimal(current);
                    if (startNode === null) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, ",") === null) {
                        parent.pop();
                        return null;
                    }
                    var endNode = this.parse_decimal(current);
                    if (endNode === null) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, ")") === null) {
                        parent.pop();
                        return null;
                    }
                    current.value = new libjass.parts.Fade(startNode.value / 1e3, endNode.value / 1e3);
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_fade = function(parent) {
                    var current = new ParseNode(parent);
                    if (this.read(current, "fade") === null) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, "(") === null) {
                        parent.pop();
                        return null;
                    }
                    var a1Node = this.parse_decimal(current);
                    if (a1Node === null) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, ",") === null) {
                        parent.pop();
                        return null;
                    }
                    var a2Node = this.parse_decimal(current);
                    if (a2Node === null) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, ",") === null) {
                        parent.pop();
                        return null;
                    }
                    var a3Node = this.parse_decimal(current);
                    if (a3Node === null) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, ",") === null) {
                        parent.pop();
                        return null;
                    }
                    var t1Node = this.parse_decimal(current);
                    if (t1Node === null) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, ",") === null) {
                        parent.pop();
                        return null;
                    }
                    var t2Node = this.parse_decimal(current);
                    if (t2Node === null) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, ",") === null) {
                        parent.pop();
                        return null;
                    }
                    var t3Node = this.parse_decimal(current);
                    if (t3Node === null) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, ",") === null) {
                        parent.pop();
                        return null;
                    }
                    var t4Node = this.parse_decimal(current);
                    if (t4Node === null) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, ")") === null) {
                        parent.pop();
                        return null;
                    }
                    current.value = new libjass.parts.ComplexFade(1 - a1Node.value / 255, 1 - a2Node.value / 255, 1 - a3Node.value / 255, t1Node.value / 1e3, t2Node.value / 1e3, t3Node.value / 1e3, t4Node.value / 1e3);
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_fax = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_fay = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_fn = function(parent) {
                    var current = new ParseNode(parent);
                    if (this.read(current, "fn") === null) {
                        parent.pop();
                        return null;
                    }
                    var valueNode = new ParseNode(current, "");
                    for (var next = this._peek(); this._haveMore() && next !== "\\" && next !== "}"; next = this._peek()) {
                        valueNode.value += next;
                    }
                    if (valueNode.value.length > 0) {
                        current.value = new libjass.parts.FontName(valueNode.value);
                    } else {
                        current.value = new libjass.parts.FontName(null);
                    }
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_fr = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_frx = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_fry = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_frz = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_fs = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_fscx = function(parent) {
                    var current = new ParseNode(parent);
                    if (this.read(current, "fscx") === null) {
                        parent.pop();
                        return null;
                    }
                    var valueNode = this.parse_decimal(current);
                    if (valueNode === null) {
                        parent.pop();
                        return null;
                    }
                    current.value = new libjass.parts.FontScaleX(valueNode.value / 100);
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_fscy = function(parent) {
                    var current = new ParseNode(parent);
                    if (this.read(current, "fscy") === null) {
                        parent.pop();
                        return null;
                    }
                    var valueNode = this.parse_decimal(current);
                    if (valueNode === null) {
                        parent.pop();
                        return null;
                    }
                    current.value = new libjass.parts.FontScaleY(valueNode.value / 100);
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_fsp = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_i = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_iclip = function(parent) {
                    return this._parse_tag_clip_or_iclip("iclip", parent);
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_k = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_K = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_kf = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_ko = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_move = function(parent) {
                    var current = new ParseNode(parent);
                    if (this.read(current, "move") === null) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, "(") === null) {
                        parent.pop();
                        return null;
                    }
                    var x1Node = this.parse_decimal(current);
                    if (x1Node === null) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, ",") === null) {
                        parent.pop();
                        return null;
                    }
                    var y1Node = this.parse_decimal(current);
                    if (y1Node === null) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, ",") === null) {
                        parent.pop();
                        return null;
                    }
                    var x2Node = this.parse_decimal(current);
                    if (x2Node === null) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, ",") === null) {
                        parent.pop();
                        return null;
                    }
                    var y2Node = this.parse_decimal(current);
                    if (y2Node === null) {
                        parent.pop();
                        return null;
                    }
                    var t1Node = null;
                    var t2Node = null;
                    if (this.read(current, ",") !== null) {
                        t1Node = this.parse_decimal(current);
                        if (t1Node === null) {
                            parent.pop();
                            return null;
                        }
                        if (this.read(current, ",") === null) {
                            parent.pop();
                            return null;
                        }
                        t2Node = this.parse_decimal(current);
                        if (t2Node === null) {
                            parent.pop();
                            return null;
                        }
                    }
                    if (this.read(current, ")") === null) {
                        parent.pop();
                        return null;
                    }
                    current.value = new libjass.parts.Move(x1Node.value, y1Node.value, x2Node.value, y2Node.value, t1Node !== null ? t1Node.value / 1e3 : null, t2Node !== null ? t2Node.value / 1e3 : null);
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_org = function(parent) {
                    var current = new ParseNode(parent);
                    if (this.read(current, "org") === null) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, "(") === null) {
                        parent.pop();
                        return null;
                    }
                    var xNode = this.parse_decimal(current);
                    if (xNode === null) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, ",") === null) {
                        parent.pop();
                        return null;
                    }
                    var yNode = this.parse_decimal(current);
                    if (yNode === null) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, ")") === null) {
                        parent.pop();
                        return null;
                    }
                    current.value = new libjass.parts.RotationOrigin(xNode.value, yNode.value);
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_p = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_pbo = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_pos = function(parent) {
                    var current = new ParseNode(parent);
                    if (this.read(current, "pos") === null) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, "(") === null) {
                        parent.pop();
                        return null;
                    }
                    var xNode = this.parse_decimal(current);
                    if (xNode === null) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, ",") === null) {
                        parent.pop();
                        return null;
                    }
                    var yNode = this.parse_decimal(current);
                    if (yNode === null) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, ")") === null) {
                        parent.pop();
                        return null;
                    }
                    current.value = new libjass.parts.Position(xNode.value, yNode.value);
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_q = function(parent) {
                    var current = new ParseNode(parent);
                    if (this.read(current, "q") === null) {
                        parent.pop();
                        return null;
                    }
                    var next = this._peek();
                    if (next < "0" || next > "3") {
                        parent.pop();
                        return null;
                    }
                    var valueNode = new ParseNode(current, next);
                    current.value = new libjass.parts.WrappingStyle(parseInt(valueNode.value));
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_r = function(parent) {
                    var current = new ParseNode(parent);
                    if (this.read(current, "r") === null) {
                        parent.pop();
                        return null;
                    }
                    var valueNode = new ParseNode(current, "");
                    for (var next = this._peek(); this._haveMore() && next !== "\\" && next !== "}"; next = this._peek()) {
                        valueNode.value += next;
                    }
                    if (valueNode.value.length > 0) {
                        current.value = new libjass.parts.Reset(valueNode.value);
                    } else {
                        current.value = new libjass.parts.Reset(null);
                    }
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_s = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_shad = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_t = function(parent) {
                    var current = new ParseNode(parent);
                    if (this.read(current, "t") === null) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, "(") === null) {
                        parent.pop();
                        return null;
                    }
                    var startNode = null;
                    var endNode = null;
                    var accelNode = null;
                    var firstNode = this.parse_decimal(current);
                    if (firstNode !== null) {
                        if (this.read(current, ",") === null) {
                            parent.pop();
                            return null;
                        }
                        var secondNode = this.parse_decimal(current);
                        if (secondNode !== null) {
                            startNode = firstNode;
                            endNode = secondNode;
                            if (this.read(current, ",") === null) {
                                parent.pop();
                                return null;
                            }
                            var thirdNode = this.parse_decimal(current);
                            if (thirdNode !== null) {
                                accelNode = thirdNode;
                                if (this.read(current, ",") === null) {
                                    parent.pop();
                                    return null;
                                }
                            }
                        } else {
                            accelNode = firstNode;
                            if (this.read(current, ",") === null) {
                                parent.pop();
                                return null;
                            }
                        }
                    }
                    var transformTags = [];
                    for (var next = this._peek(); this._haveMore() && next !== ")" && next !== "}"; next = this._peek()) {
                        var childNode = null;
                        if (this.read(current, "\\") !== null) {
                            childNode = this.parse_tag_alpha(current) || this.parse_tag_iclip(current) || this.parse_tag_xbord(current) || this.parse_tag_ybord(current) || this.parse_tag_xshad(current) || this.parse_tag_yshad(current) || this.parse_tag_blur(current) || this.parse_tag_bord(current) || this.parse_tag_clip(current) || this.parse_tag_fscx(current) || this.parse_tag_fscy(current) || this.parse_tag_shad(current) || this.parse_tag_fax(current) || this.parse_tag_fay(current) || this.parse_tag_frx(current) || this.parse_tag_fry(current) || this.parse_tag_frz(current) || this.parse_tag_fsp(current) || this.parse_tag_be(current) || this.parse_tag_fr(current) || this.parse_tag_fs(current) || this.parse_tag_1a(current) || this.parse_tag_1c(current) || this.parse_tag_2a(current) || this.parse_tag_2c(current) || this.parse_tag_3a(current) || this.parse_tag_3c(current) || this.parse_tag_4a(current) || this.parse_tag_4c(current) || this.parse_tag_c(current);
                            if (childNode === null) {
                                current.pop();
                            }
                        }
                        if (childNode === null) {
                            childNode = this.parse_comment(current);
                        }
                        if (childNode !== null) {
                            if (childNode.value instanceof libjass.parts.Comment && transformTags[transformTags.length - 1] instanceof libjass.parts.Comment) {
                                // Merge consecutive comment parts into one part
                                transformTags[transformTags.length - 1] = new libjass.parts.Comment(transformTags[transformTags.length - 1].value + childNode.value.value);
                            } else {
                                transformTags.push(childNode.value);
                            }
                        } else {
                            parent.pop();
                            return null;
                        }
                    }
                    this.read(current, ")");
                    current.value = new libjass.parts.Transform(startNode !== null ? startNode.value / 1e3 : null, endNode !== null ? endNode.value / 1e3 : null, accelNode !== null ? accelNode.value / 1e3 : null, transformTags);
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_u = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_xbord = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_xshad = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_ybord = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_yshad = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_1a = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_1c = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_2a = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_2c = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_3a = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_3c = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_4a = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_tag_4c = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_drawingInstructions = function(parent) {
                    var current = new ParseNode(parent);
                    var lastType = null;
                    current.value = [];
                    while (this._haveMore()) {
                        while (this.read(current, " ") !== null) {}
                        var currentType = null;
                        var typePart = this.parse_text(current);
                        if (typePart === null) {
                            parent.pop();
                            return null;
                        }
                        currentType = typePart.value.value;
                        switch (currentType) {
                          case "m":
                          case "l":
                          case "b":
                            lastType = currentType;
                            break;

                          default:
                            if (lastType === null) {
                                parent.pop();
                                return null;
                            }
                            currentType = lastType;
                            current.pop();
                            break;
                        }
                        switch (currentType) {
                          case "m":
                            var movePart = this.parse_drawingInstructionMove(current);
                            if (movePart === null) {
                                parent.pop();
                                return null;
                            }
                            current.value.push(movePart.value);
                            break;

                          case "l":
                            var linePart = this.parse_drawingInstructionLine(current);
                            if (linePart === null) {
                                parent.pop();
                                return null;
                            }
                            current.value.push(linePart.value);
                            break;

                          case "b":
                            var cubicBezierCurvePart = this.parse_drawingInstructionCubicBezierCurve(current);
                            if (cubicBezierCurvePart === null) {
                                parent.pop();
                                return null;
                            }
                            current.value.push(cubicBezierCurvePart.value);
                            break;
                        }
                    }
                    while (this.read(current, " ") !== null) {}
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_drawingInstructionMove = function(parent) {
                    var current = new ParseNode(parent);
                    while (this.read(current, " ") !== null) {}
                    var xPart = this.parse_decimal(current);
                    if (xPart === null) {
                        parent.pop();
                        return null;
                    }
                    while (this.read(current, " ") !== null) {}
                    var yPart = this.parse_decimal(current);
                    if (yPart === null) {
                        parent.pop();
                        return null;
                    }
                    current.value = new libjass.parts.drawing.MoveInstruction(xPart.value, yPart.value);
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_drawingInstructionLine = function(parent) {
                    var current = new ParseNode(parent);
                    while (this.read(current, " ") !== null) {}
                    var xPart = this.parse_decimal(current);
                    if (xPart === null) {
                        parent.pop();
                        return null;
                    }
                    while (this.read(current, " ") !== null) {}
                    var yPart = this.parse_decimal(current);
                    if (yPart === null) {
                        parent.pop();
                        return null;
                    }
                    current.value = new libjass.parts.drawing.LineInstruction(xPart.value, yPart.value);
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_drawingInstructionCubicBezierCurve = function(parent) {
                    var current = new ParseNode(parent);
                    while (this.read(current, " ") !== null) {}
                    var x1Part = this.parse_decimal(current);
                    if (x1Part === null) {
                        parent.pop();
                        return null;
                    }
                    while (this.read(current, " ") !== null) {}
                    var y1Part = this.parse_decimal(current);
                    if (y1Part === null) {
                        parent.pop();
                        return null;
                    }
                    var x2Part = this.parse_decimal(current);
                    if (x2Part === null) {
                        parent.pop();
                        return null;
                    }
                    while (this.read(current, " ") !== null) {}
                    var y2Part = this.parse_decimal(current);
                    if (y2Part === null) {
                        parent.pop();
                        return null;
                    }
                    var x3Part = this.parse_decimal(current);
                    if (x3Part === null) {
                        parent.pop();
                        return null;
                    }
                    while (this.read(current, " ") !== null) {}
                    var y3Part = this.parse_decimal(current);
                    if (y3Part === null) {
                        parent.pop();
                        return null;
                    }
                    current.value = new libjass.parts.drawing.CubicBezierCurveInstruction(x1Part.value, y1Part.value, x2Part.value, y2Part.value, x3Part.value, y3Part.value);
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_decimal = function(parent) {
                    var current = new ParseNode(parent);
                    var negative = this.read(current, "-") !== null;
                    var numericalPart = this.parse_unsignedDecimal(current);
                    if (numericalPart === null) {
                        parent.pop();
                        return null;
                    }
                    current.value = numericalPart.value;
                    if (negative) {
                        current.value = -current.value;
                    }
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_unsignedDecimal = function(parent) {
                    var current = new ParseNode(parent);
                    var characteristicNode = new ParseNode(current, "");
                    var mantissaNode = null;
                    var next;
                    for (next = this._peek(); this._haveMore() && next >= "0" && next <= "9"; next = this._peek()) {
                        characteristicNode.value += next;
                    }
                    if (characteristicNode.value.length === 0) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, ".") !== null) {
                        mantissaNode = new ParseNode(current, "");
                        for (next = this._peek(); this._haveMore() && next >= "0" && next <= "9"; next = this._peek()) {
                            mantissaNode.value += next;
                        }
                        if (mantissaNode.value.length === 0) {
                            parent.pop();
                            return null;
                        }
                    }
                    current.value = parseFloat(characteristicNode.value + (mantissaNode !== null ? "." + mantissaNode.value : ""));
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_enableDisable = function(parent) {
                    var next = this._peek();
                    if (next === "0" || next === "1") {
                        var result = new ParseNode(parent, next);
                        result.value = result.value === "1";
                        return result;
                    }
                    return null;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_hex = function(parent) {
                    var next = this._peek();
                    if (next >= "0" && next <= "9" || next >= "a" && next <= "f" || next >= "A" && next <= "F") {
                        return new ParseNode(parent, next);
                    }
                    return null;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_color = function(parent) {
                    var current = new ParseNode(parent);
                    if (this.read(current, "&") === null) {
                        parent.pop();
                        return null;
                    }
                    this.read(current, "H");
                    var digitNodes = new Array(6);
                    for (var i = 0; i < digitNodes.length; i++) {
                        var digitNode = this.parse_hex(current);
                        if (digitNode === null) {
                            parent.pop();
                            return null;
                        }
                        digitNodes[i] = digitNode;
                    }
                    // Optional extra 00 at the end
                    if (this.read(current, "0") !== null) {
                        if (this.read(current, "0") === null) {
                            parent.pop();
                            return null;
                        }
                    }
                    if (this.read(current, "&") === null) {
                        parent.pop();
                        return null;
                    }
                    current.value = new libjass.parts.Color(parseInt(digitNodes[4].value + digitNodes[5].value, 16), parseInt(digitNodes[2].value + digitNodes[3].value, 16), parseInt(digitNodes[0].value + digitNodes[1].value, 16));
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_alpha = function(parent) {
                    var current = new ParseNode(parent);
                    if (this.read(current, "&") !== null) {
                        this.read(current, "H");
                    }
                    var firstDigitNode = this.parse_hex(current);
                    if (firstDigitNode === null) {
                        parent.pop();
                        return null;
                    }
                    var secondDigitNode = this.parse_hex(current);
                    this.read(current, "&");
                    current.value = 1 - parseInt(firstDigitNode.value + (secondDigitNode !== null ? secondDigitNode : firstDigitNode).value, 16) / 255;
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.parse_colorWithAlpha = function(parent) {
                    var current = new ParseNode(parent);
                    if (this.read(current, "&H") === null) {
                        parent.pop();
                        return null;
                    }
                    var digitNodes = new Array(8);
                    for (var i = 0; i < digitNodes.length; i++) {
                        var digitNode = this.parse_hex(current);
                        if (digitNode === null) {
                            parent.pop();
                            return null;
                        }
                        digitNodes[i] = digitNode;
                    }
                    current.value = new libjass.parts.Color(parseInt(digitNodes[6].value + digitNodes[7].value, 16), parseInt(digitNodes[4].value + digitNodes[5].value, 16), parseInt(digitNodes[2].value + digitNodes[3].value, 16), 1 - parseInt(digitNodes[0].value + digitNodes[1].value, 16) / 255);
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @param {string} next
                 * @return {!ParseNode}
                 */
                ParserRun.prototype.read = function(parent, next) {
                    if (this._peek(next.length) !== next) {
                        return null;
                    }
                    return new ParseNode(parent, next);
                };
                /**
                 * @param {number=1} count
                 */
                ParserRun.prototype._peek = function(count) {
                    if (typeof count === "undefined") {
                        count = 1;
                    }
                    return this._input.substr(this._parseTree.end, count);
                };
                /**
                 * @return {boolean}
                 */
                ParserRun.prototype._haveMore = function() {
                    return this._parseTree.end < this._input.length;
                };
                /**
                 * @param {string} tagName One of "clip" and "iclip"
                 * @param {!ParseNode} parent
                 * @return {!ParseNode}
                 */
                ParserRun.prototype._parse_tag_clip_or_iclip = function(tagName, parent) {
                    var current = new ParseNode(parent);
                    if (this.read(current, tagName) === null) {
                        parent.pop();
                        return null;
                    }
                    if (this.read(current, "(") === null) {
                        parent.pop();
                        return null;
                    }
                    var x1Node = null;
                    var x2Node = null;
                    var y1Node = null;
                    var y2Node = null;
                    var scaleNode = null;
                    var commandsNode = null;
                    var firstNode = this.parse_decimal(current);
                    if (firstNode !== null) {
                        if (this.read(current, ",") === null) {
                            parent.pop();
                            return null;
                        }
                        var secondNode = this.parse_decimal(current);
                        if (secondNode !== null) {
                            x1Node = firstNode;
                            y1Node = secondNode;
                        } else {
                            scaleNode = firstNode;
                        }
                    }
                    if (x1Node !== null && y1Node !== null) {
                        if (this.read(current, ",") === null) {
                            parent.pop();
                            return null;
                        }
                        x2Node = this.parse_decimal(current);
                        if (this.read(current, ",") === null) {
                            parent.pop();
                            return null;
                        }
                        y2Node = this.parse_decimal(current);
                        current.value = new libjass.parts.RectangularClip(x1Node.value, y1Node.value, x2Node.value, y2Node.value, tagName === "clip");
                    } else {
                        commandsNode = new ParseNode(current, "");
                        for (var next = this._peek(); this._haveMore() && next !== ")" && next !== "}"; next = this._peek()) {
                            commandsNode.value += next;
                        }
                        current.value = new libjass.parts.VectorClip(scaleNode !== null ? scaleNode.value : 1, parser.parse(commandsNode.value, "drawingInstructions"), tagName === "clip");
                    }
                    if (this.read(current, ")") === null) {
                        parent.pop();
                        return null;
                    }
                    return current;
                };
                return ParserRun;
            }();
            function makeTagParserFunction(tagName, tagConstructor, valueParser, required) {
                ParserRun.prototype["parse_tag_" + tagName] = function(parent) {
                    var self = this;
                    var current = new ParseNode(parent);
                    if (self.read(current, tagName) === null) {
                        parent.pop();
                        return null;
                    }
                    var valueNode = valueParser.call(self, current);
                    if (valueNode !== null) {
                        current.value = new tagConstructor(valueNode.value);
                    } else if (required) {
                        current.value = new tagConstructor(null);
                    } else {
                        parent.pop();
                        return null;
                    }
                    return current;
                };
            }
            makeTagParserFunction("alpha", libjass.parts.Alpha, ParserRun.prototype.parse_alpha, false);
            makeTagParserFunction("be", libjass.parts.Blur, ParserRun.prototype.parse_decimal, false);
            makeTagParserFunction("blur", libjass.parts.GaussianBlur, ParserRun.prototype.parse_decimal, false);
            makeTagParserFunction("bord", libjass.parts.Border, ParserRun.prototype.parse_decimal, false);
            makeTagParserFunction("c", libjass.parts.PrimaryColor, ParserRun.prototype.parse_color, false);
            makeTagParserFunction("fax", libjass.parts.SkewX, ParserRun.prototype.parse_decimal, false);
            makeTagParserFunction("fay", libjass.parts.SkewY, ParserRun.prototype.parse_decimal, false);
            makeTagParserFunction("fr", libjass.parts.RotateZ, ParserRun.prototype.parse_decimal, false);
            makeTagParserFunction("frx", libjass.parts.RotateX, ParserRun.prototype.parse_decimal, false);
            makeTagParserFunction("fry", libjass.parts.RotateY, ParserRun.prototype.parse_decimal, false);
            makeTagParserFunction("frz", libjass.parts.RotateZ, ParserRun.prototype.parse_decimal, false);
            makeTagParserFunction("fs", libjass.parts.FontSize, ParserRun.prototype.parse_decimal, false);
            makeTagParserFunction("fsp", libjass.parts.LetterSpacing, ParserRun.prototype.parse_decimal, false);
            makeTagParserFunction("i", libjass.parts.Italic, ParserRun.prototype.parse_enableDisable, false);
            makeTagParserFunction("k", libjass.parts.ColorKaraoke, ParserRun.prototype.parse_decimal, true);
            makeTagParserFunction("K", libjass.parts.SweepingColorKaraoke, ParserRun.prototype.parse_decimal, true);
            makeTagParserFunction("kf", libjass.parts.SweepingColorKaraoke, ParserRun.prototype.parse_decimal, true);
            makeTagParserFunction("ko", libjass.parts.OutlineKaraoke, ParserRun.prototype.parse_decimal, true);
            makeTagParserFunction("p", libjass.parts.DrawingMode, ParserRun.prototype.parse_decimal, true);
            makeTagParserFunction("pbo", libjass.parts.DrawingBaselineOffset, ParserRun.prototype.parse_decimal, true);
            makeTagParserFunction("s", libjass.parts.StrikeThrough, ParserRun.prototype.parse_enableDisable, false);
            makeTagParserFunction("shad", libjass.parts.Shadow, ParserRun.prototype.parse_decimal, false);
            makeTagParserFunction("u", libjass.parts.Underline, ParserRun.prototype.parse_enableDisable, false);
            makeTagParserFunction("xbord", libjass.parts.BorderX, ParserRun.prototype.parse_decimal, false);
            makeTagParserFunction("xshad", libjass.parts.ShadowX, ParserRun.prototype.parse_decimal, false);
            makeTagParserFunction("ybord", libjass.parts.BorderY, ParserRun.prototype.parse_decimal, false);
            makeTagParserFunction("yshad", libjass.parts.ShadowY, ParserRun.prototype.parse_decimal, false);
            makeTagParserFunction("1a", libjass.parts.PrimaryAlpha, ParserRun.prototype.parse_alpha, false);
            makeTagParserFunction("1c", libjass.parts.PrimaryColor, ParserRun.prototype.parse_color, false);
            makeTagParserFunction("2a", libjass.parts.SecondaryAlpha, ParserRun.prototype.parse_alpha, false);
            makeTagParserFunction("2c", libjass.parts.SecondaryColor, ParserRun.prototype.parse_color, false);
            makeTagParserFunction("3a", libjass.parts.OutlineAlpha, ParserRun.prototype.parse_alpha, false);
            makeTagParserFunction("3c", libjass.parts.OutlineColor, ParserRun.prototype.parse_color, false);
            makeTagParserFunction("4a", libjass.parts.ShadowAlpha, ParserRun.prototype.parse_alpha, false);
            makeTagParserFunction("4c", libjass.parts.ShadowColor, ParserRun.prototype.parse_color, false);
            var rules = new libjass.Map();
            Object.keys(ParserRun.prototype).forEach(function(key) {
                if (key.indexOf("parse_") === 0 && typeof ParserRun.prototype[key] === "function") {
                    rules.set(key.substr("parse_".length), ParserRun.prototype[key]);
                }
            });
            /**
             * This class represents a single parse node. It has a start and end position, and an optional value object.
             *
             * @constructor
             * @param {!ParseNode} parent The parent of this parse node. The parent's end position will be updated to the end position of this node whenever the latter changes.
             * @param {?string=null} value A shortcut to assign a string to the value property.
             *
             * @private
             * @memberof libjass.parser
             */
            var ParseNode = function() {
                function ParseNode(parent, value) {
                    if (typeof value === "undefined") {
                        value = null;
                    }
                    this._parent = parent;
                    this._children = [];
                    if (parent !== null) {
                        parent._children.push(this);
                    }
                    this._start = parent !== null ? parent.end : 0;
                    if (value !== null) {
                        this.value = value;
                    } else {
                        this._setEnd(this._start);
                    }
                }
                Object.defineProperty(ParseNode.prototype, "start", {
                    /**
                     * The start position of this parse node.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._start;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ParseNode.prototype, "end", {
                    /**
                     * The end position of this parse node.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._end;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ParseNode.prototype, "parent", {
                    /**
                     * @type {!ParseNode}
                     */
                    get: function() {
                        return this._parent;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ParseNode.prototype, "children", {
                    /**
                     * @type {!Array.<!ParseNode>}
                     */
                    get: function() {
                        return this._children;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ParseNode.prototype, "value", {
                    /**
                     * An optional object associated with this parse node.
                     *
                     * @type {*}
                     */
                    get: function() {
                        return this._value;
                    },
                    /**
                     * An optional object associated with this parse node.
                     *
                     * If the value is a string, then the end property is updated to be the length of the string.
                     *
                     * @type {*}
                     */
                    set: function(newValue) {
                        this._value = newValue;
                        if (this._value.constructor === String && this._children.length === 0) {
                            this._setEnd(this._start + this._value.length);
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * Removes the last child of this node and updates the end position to be end position of the new last child.
                 */
                ParseNode.prototype.pop = function() {
                    this._children.splice(this._children.length - 1, 1);
                    if (this._children.length > 0) {
                        this._setEnd(this._children[this._children.length - 1].end);
                    } else {
                        this._setEnd(this.start);
                    }
                };
                /**
                 * Updates the end property of this node and its parent recursively to the root node.
                 *
                 * @param {number} newEnd
                 */
                ParseNode.prototype._setEnd = function(newEnd) {
                    this._end = newEnd;
                    if (this._parent !== null && this._parent.end !== this._end) {
                        this._parent._setEnd(this._end);
                    }
                };
                return ParseNode;
            }();
        })(libjass.parser || (libjass.parser = {}));
    })(libjass || (libjass = {}));
    var __extends = function(d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() {
            this.constructor = d;
        }
        __.prototype = b.prototype;
        d.prototype = new __();
    };
    (function(libjass) {
        (function(renderers) {
            /**
             * A renderer implementation that doesn't output anything.
             *
             * @constructor
             *
             * @param {!HTMLVideoElement} video
             * @param {!libjass.ASS} ass
             * @param {!libjass.renderers.RendererSettings} settings
             *
             * @memberof libjass.renderers
             */
            var NullRenderer = function() {
                function NullRenderer(video, ass, settings) {
                    var _this = this;
                    this._video = video;
                    this._ass = ass;
                    this._timeUpdateIntervalHandle = null;
                    this._id = ++NullRenderer._lastRendererId;
                    this._settings = RendererSettings.from(settings);
                    // Sort the dialogues array by end time and then by their original position in the script (id)
                    this._dialogues = this._ass.dialogues.slice(0);
                    this._dialogues.sort(function(dialogue1, dialogue2) {
                        var result = dialogue1.end - dialogue2.end;
                        if (result === 0) {
                            result = dialogue1.id - dialogue2.id;
                        }
                        return result;
                    });
                    this._endTimes = this._dialogues.map(function(dialogue) {
                        return dialogue.end;
                    });
                    this._video.addEventListener("timeupdate", function() {
                        return _this._onVideoTimeUpdate();
                    }, false);
                    this._video.addEventListener("seeking", function() {
                        return _this._onVideoSeeking();
                    }, false);
                    this._video.addEventListener("pause", function() {
                        return _this._onVideoPause();
                    }, false);
                    this._video.addEventListener("playing", function() {
                        return _this._onVideoPlaying();
                    }, false);
                }
                Object.defineProperty(NullRenderer.prototype, "id", {
                    /**
                     * The unique ID of this renderer. Auto-generated.
                     *
                     * @type {number}
                     */
                    get: function() {
                        return this._id;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(NullRenderer.prototype, "video", {
                    /**
                     * @type {!HTMLVideoElement}
                     */
                    get: function() {
                        return this._video;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(NullRenderer.prototype, "ass", {
                    /**
                     * @type {!libjass.ASS}
                     */
                    get: function() {
                        return this._ass;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(NullRenderer.prototype, "settings", {
                    /**
                     * @type {!libjass.renderers.RendererSettings}
                     */
                    get: function() {
                        return this._settings;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(NullRenderer.prototype, "currentTime", {
                    /**
                     * @type {number}
                     */
                    get: function() {
                        return this._currentTime;
                    },
                    enumerable: true,
                    configurable: true
                });
                NullRenderer.prototype.onVideoTimeUpdate = function() {
                    this._currentTime = this._video.currentTime;
                    if (libjass.verboseMode) {
                        console.log("NullRenderer.onVideoTimeUpdate: " + this._getVideoStateLogString());
                    }
                    var searchStart = 0;
                    var searchEnd = this._endTimes.length;
                    while (searchStart !== searchEnd) {
                        var mid = (searchStart + searchEnd) / 2 | 0;
                        if (this._endTimes[mid] < this._currentTime) {
                            searchStart = mid + 1;
                        } else {
                            searchEnd = mid;
                        }
                    }
                    for (var i = searchStart; i < this._endTimes.length; i++) {
                        var dialogue = this._dialogues[i];
                        if (dialogue.start <= this._currentTime) {
                            // This dialogue is visible right now. Draw it.
                            this.draw(dialogue);
                        } else if (dialogue.start <= this._currentTime + this._settings.preRenderTime) {
                            // This dialogue will be visible soon. Pre-render it.
                            this.preRender(dialogue);
                        } else {
                            break;
                        }
                    }
                };
                NullRenderer.prototype.onVideoSeeking = function() {
                    if (libjass.verboseMode) {
                        console.log("NullRenderer.onVideoSeeking: " + this._getVideoStateLogString());
                    }
                };
                NullRenderer.prototype.onVideoPause = function() {
                    if (libjass.verboseMode) {
                        console.log("NullRenderer.onVideoPause: " + this._getVideoStateLogString());
                    }
                    if (this._timeUpdateIntervalHandle !== null) {
                        clearInterval(this._timeUpdateIntervalHandle);
                        this._timeUpdateIntervalHandle = null;
                    }
                };
                NullRenderer.prototype.onVideoPlaying = function() {
                    var _this = this;
                    if (libjass.verboseMode) {
                        console.log("NullRenderer.onVideoPlaying: " + this._getVideoStateLogString());
                    }
                    if (this._timeUpdateIntervalHandle === null) {
                        this._timeUpdateIntervalHandle = setInterval(function() {
                            return _this._onVideoTimeChange();
                        }, NullRenderer._highResolutionTimerInterval);
                    }
                };
                /**
                 */
                /* tslint:disable:no-empty */
                NullRenderer.prototype.preRender = function() {};
                /**
                 */
                /* tslint:disable:no-empty */
                NullRenderer.prototype.draw = function() {};
                NullRenderer.prototype._onVideoTimeUpdate = function() {
                    if (this._state === 2) {
                        if (this._currentTime !== this._video.currentTime) {
                            this._onVideoPlaying();
                        }
                    }
                };
                NullRenderer.prototype._onVideoTimeChange = function() {
                    if (this._currentTime !== this._video.currentTime) {
                        if (this._state !== 0) {
                            this._onVideoPlaying();
                        }
                        this.onVideoTimeUpdate();
                    }
                };
                NullRenderer.prototype._onVideoSeeking = function() {
                    if (this._state !== 2) {
                        this._onVideoPause();
                        this._state = 2;
                    }
                    if (this._currentTime !== this._video.currentTime) {
                        this._currentTime = this._video.currentTime;
                        this.onVideoSeeking();
                    }
                };
                NullRenderer.prototype._onVideoPause = function() {
                    this._state = 1;
                    this.onVideoPause();
                };
                NullRenderer.prototype._onVideoPlaying = function() {
                    this._state = 0;
                    this.onVideoPlaying();
                };
                NullRenderer.prototype._getVideoStateLogString = function() {
                    return "video.currentTime = " + this._video.currentTime + ", video.paused = " + this._video.paused + ", video.seeking = " + this._video.seeking;
                };
                NullRenderer._highResolutionTimerInterval = 41;
                NullRenderer._lastRendererId = -1;
                return NullRenderer;
            }();
            renderers.NullRenderer = NullRenderer;
            var VideoState;
            (function(VideoState) {
                VideoState[VideoState["Playing"] = 0] = "Playing";
                VideoState[VideoState["Paused"] = 1] = "Paused";
                VideoState[VideoState["Seeking"] = 2] = "Seeking";
            })(VideoState || (VideoState = {}));
            /**
             * A default renderer implementation.
             *
             * @constructor
             * @extends {libjass.renderers.NullRenderer}
             *
             * @param {!HTMLVideoElement} video
             * @param {!libjass.ASS} ass
             * @param {!libjass.renderers.RendererSettings} settings
             *
             * @memberof libjass.renderers
             */
            var DefaultRenderer = function(_super) {
                __extends(DefaultRenderer, _super);
                function DefaultRenderer(video, ass, settings) {
                    var _this = this;
                    _super.call(this, video, ass, settings);
                    this._layerAlignmentWrappers = [];
                    this._animationStyleElement = null;
                    this._svgDefsElement = null;
                    this._currentSubs = new libjass.Map();
                    this._preRenderedSubs = new libjass.Map();
                    this._videoIsFullScreen = false;
                    this._eventListeners = new libjass.Map();
                    this._videoSubsWrapper = document.createElement("div");
                    video.parentElement.replaceChild(this._videoSubsWrapper, video);
                    this._videoSubsWrapper.className = "libjass-wrapper";
                    this._videoSubsWrapper.appendChild(video);
                    this._subsWrapper = document.createElement("div");
                    this._videoSubsWrapper.appendChild(this._subsWrapper);
                    this._subsWrapper.className = "libjass-subs";
                    var svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    this._videoSubsWrapper.appendChild(svgElement);
                    svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                    svgElement.setAttribute("version", "1.1");
                    svgElement.setAttribute("class", "libjass-filters");
                    svgElement.setAttribute("width", "0");
                    svgElement.setAttribute("height", "0");
                    this._svgDefsElement = document.createElementNS("http://www.w3.org/2000/svg", "defs");
                    svgElement.appendChild(this._svgDefsElement);
                    if (this.settings.fontMap === null) {
                        setTimeout(function() {
                            return _this._ready();
                        }, 0);
                    } else {
                        var urlsToPreload = [];
                        this.settings.fontMap.forEach(function(src) {
                            urlsToPreload.unshift.apply(urlsToPreload, src);
                        });
                        var urlsLeftToPreload = urlsToPreload.length;
                        if (libjass.debugMode) {
                            console.log("Preloading fonts...");
                        }
                        urlsToPreload.forEach(function(url) {
                            var xhr = new XMLHttpRequest();
                            xhr.open("GET", url, true);
                            xhr.addEventListener("readystatechange", function() {
                                if (xhr.readyState === XMLHttpRequest.DONE) {
                                    if (libjass.debugMode) {
                                        console.log("Preloaded " + url + ".");
                                    }
                                    --urlsLeftToPreload;
                                    if (libjass.debugMode) {
                                        console.log(urlsLeftToPreload + " fonts left to preload.");
                                    }
                                    if (urlsLeftToPreload === 0) {
                                        if (libjass.debugMode) {
                                            console.log("All fonts have been preloaded.");
                                        }
                                        _this._ready();
                                    }
                                }
                            }, false);
                            xhr.send(null);
                            return xhr;
                        });
                        if (libjass.debugMode) {
                            console.log(urlsLeftToPreload + " fonts left to preload.");
                        }
                        if (urlsLeftToPreload === 0) {
                            setTimeout(function() {
                                if (libjass.debugMode) {
                                    console.log("All fonts have been preloaded.");
                                }
                                _this._ready();
                            }, 0);
                        }
                    }
                    this._eventListeners.set("ready", []);
                    this._eventListeners.set("fullScreenChange", []);
                }
                /**
                 * Add a listener for the given event.
                 *
                 * The "ready" event is fired when fonts have been preloaded if settings.preLoadFonts is true, or in the next tick after the DefaultRenderer object is constructed otherwise.
                 *
                 * The "fullScreenChange" event is fired when the browser's fullscreenchange event is fired for the video element.
                 *
                 * @param {string} type The type of event to attach the listener for. One of "ready" and "fullScreenChange".
                 * @param {!Function} listener The listener
                 */
                DefaultRenderer.prototype.addEventListener = function(type, listener) {
                    var listeners = this._eventListeners.get(type);
                    if (listeners !== null) {
                        listeners.push(listener);
                    }
                };
                /**
                 * Resize the subtitles to the given new dimensions.
                 *
                 * @param {number} width
                 * @param {number} height
                 */
                DefaultRenderer.prototype.resizeVideo = function(width, height) {
                    this._removeAllSubs();
                    var ratio = Math.min(width / this.ass.properties.resolutionX, height / this.ass.properties.resolutionY);
                    var subsWrapperWidth = this.ass.properties.resolutionX * ratio;
                    var subsWrapperHeight = this.ass.properties.resolutionY * ratio;
                    this._subsWrapper.style.width = subsWrapperWidth.toFixed(3) + "px";
                    this._subsWrapper.style.height = subsWrapperHeight.toFixed(3) + "px";
                    this._subsWrapper.style.left = ((width - subsWrapperWidth) / 2).toFixed(3) + "px";
                    this._subsWrapper.style.top = ((height - subsWrapperHeight) / 2).toFixed(3) + "px";
                    this._scaleX = subsWrapperWidth / this.ass.properties.resolutionX;
                    this._scaleY = subsWrapperHeight / this.ass.properties.resolutionY;
                    // Any dialogues which have been pre-rendered will need to be pre-rendered again.
                    this._preRenderedSubs.clear();
                    if (this._animationStyleElement !== null) {
                        while (this._animationStyleElement.firstChild !== null) {
                            this._animationStyleElement.removeChild(this._animationStyleElement.firstChild);
                        }
                    }
                    while (this._svgDefsElement.firstChild !== null) {
                        this._svgDefsElement.removeChild(this._svgDefsElement.firstChild);
                    }
                    this.onVideoTimeUpdate();
                };
                DefaultRenderer.prototype.onVideoSeeking = function() {
                    _super.prototype.onVideoSeeking.call(this);
                    this._removeAllSubs();
                };
                DefaultRenderer.prototype.onVideoTimeUpdate = function() {
                    var _this = this;
                    _super.prototype.onVideoTimeUpdate.call(this);
                    this._currentSubs.forEach(function(sub, dialogueId) {
                        var dialogue = _this.ass.dialogues[dialogueId];
                        if (dialogue.start > _this.currentTime || dialogue.end < _this.currentTime) {
                            _this._currentSubs.delete(dialogueId);
                            _this._removeSub(sub);
                        }
                    });
                };
                DefaultRenderer.prototype.onVideoPause = function() {
                    _super.prototype.onVideoPause.call(this);
                    this._subsWrapper.classList.add("paused");
                };
                DefaultRenderer.prototype.onVideoPlaying = function() {
                    _super.prototype.onVideoPlaying.call(this);
                    this._subsWrapper.classList.remove("paused");
                };
                /**
                 * The magic happens here. The subtitle div is rendered and stored. Call draw() to get a clone of the div to display.
                 *
                 * @param {!libjass.Dialogue} dialogue
                 */
                DefaultRenderer.prototype.preRender = function(dialogue) {
                    var _this = this;
                    if (this._preRenderedSubs.has(dialogue.id)) {
                        return;
                    }
                    var sub = document.createElement("div");
                    sub.style.marginLeft = this._scaleX * dialogue.style.marginLeft + "px";
                    sub.style.marginRight = this._scaleX * dialogue.style.marginRight + "px";
                    sub.style.marginTop = sub.style.marginBottom = this._scaleY * dialogue.style.marginVertical + "px";
                    switch (dialogue.alignment) {
                      case 1:
                      case 4:
                      case 7:
                        sub.style.textAlign = "left";
                        break;

                      case 2:
                      case 5:
                      case 8:
                        sub.style.textAlign = "center";
                        break;

                      case 3:
                      case 6:
                      case 9:
                        sub.style.textAlign = "right";
                        break;
                    }
                    var animationCollection = new AnimationCollection(this, dialogue);
                    var divTransformStyle = "";
                    var currentSpan = null;
                    var currentSpanStyles = new SpanStyles(this, dialogue, this._scaleX, this._scaleY, this._svgDefsElement);
                    var startNewSpan = function() {
                        if (currentSpan !== null) {
                            sub.appendChild(currentSpanStyles.setStylesOnSpan(currentSpan));
                        }
                        currentSpan = document.createElement("span");
                    };
                    startNewSpan();
                    var currentDrawing = null;
                    dialogue.parts.forEach(function(part) {
                        if (part instanceof libjass.parts.Italic) {
                            currentSpanStyles.italic = part.value;
                        } else if (part instanceof libjass.parts.Bold) {
                            currentSpanStyles.bold = part.value;
                        } else if (part instanceof libjass.parts.Underline) {
                            currentSpanStyles.underline = part.value;
                        } else if (part instanceof libjass.parts.StrikeThrough) {
                            currentSpanStyles.strikeThrough = part.value;
                        } else if (part instanceof libjass.parts.Border) {
                            currentSpanStyles.outlineWidth = part.value;
                            currentSpanStyles.outlineHeight = part.value;
                        } else if (part instanceof libjass.parts.BorderX) {
                            currentSpanStyles.outlineWidth = part.value;
                        } else if (part instanceof libjass.parts.BorderY) {
                            currentSpanStyles.outlineHeight = part.value;
                        } else if (part instanceof libjass.parts.Shadow) {
                            currentSpanStyles.shadowDepthX = part.value;
                            currentSpanStyles.shadowDepthY = part.value;
                        } else if (part instanceof libjass.parts.ShadowX) {
                            currentSpanStyles.shadowDepthX = part.value;
                        } else if (part instanceof libjass.parts.ShadowY) {
                            currentSpanStyles.shadowDepthY = part.value;
                        } else if (part instanceof libjass.parts.GaussianBlur) {
                            currentSpanStyles.blur = part.value;
                        } else if (part instanceof libjass.parts.FontName) {
                            currentSpanStyles.fontName = part.value;
                        } else if (part instanceof libjass.parts.FontSize) {
                            currentSpanStyles.fontSize = part.value;
                        } else if (part instanceof libjass.parts.FontScaleX) {
                            currentSpanStyles.fontScaleX = part.value;
                        } else if (part instanceof libjass.parts.FontScaleY) {
                            currentSpanStyles.fontScaleY = part.value;
                        } else if (part instanceof libjass.parts.LetterSpacing) {
                            currentSpanStyles.letterSpacing = part.value;
                        } else if (part instanceof libjass.parts.RotateX) {
                            divTransformStyle += " rotateX(" + part.value + "deg)";
                        } else if (part instanceof libjass.parts.RotateY) {
                            divTransformStyle += " rotateY(" + part.value + "deg)";
                        } else if (part instanceof libjass.parts.RotateZ) {
                            divTransformStyle += " rotateZ(" + -1 * part.value + "deg)";
                        } else if (part instanceof libjass.parts.SkewX) {
                            divTransformStyle += " skewX(" + 45 * part.value + "deg)";
                        } else if (part instanceof libjass.parts.SkewY) {
                            divTransformStyle += " skewY(" + 45 * part.value + "deg)";
                        } else if (part instanceof libjass.parts.PrimaryColor) {
                            currentSpanStyles.primaryColor = part.value;
                        } else if (part instanceof libjass.parts.OutlineColor) {
                            currentSpanStyles.outlineColor = part.value;
                        } else if (part instanceof libjass.parts.ShadowColor) {
                            currentSpanStyles.shadowColor = part.value;
                        } else if (part instanceof libjass.parts.Alpha) {
                            currentSpanStyles.primaryAlpha = part.value;
                            currentSpanStyles.outlineAlpha = part.value;
                            currentSpanStyles.shadowAlpha = part.value;
                        } else if (part instanceof libjass.parts.PrimaryAlpha) {
                            currentSpanStyles.primaryAlpha = part.value;
                        } else if (part instanceof libjass.parts.OutlineAlpha) {
                            currentSpanStyles.outlineAlpha = part.value;
                        } else if (part instanceof libjass.parts.ShadowAlpha) {
                            currentSpanStyles.shadowAlpha = part.value;
                        } else if (part instanceof libjass.parts.Alignment) {} else if (part instanceof libjass.parts.Reset) {
                            var newStyleName = part.value;
                            var newStyle = null;
                            if (newStyleName !== null) {
                                newStyle = _this.ass.styles[newStyleName];
                            }
                            currentSpanStyles.reset(newStyle);
                        } else if (part instanceof libjass.parts.Position) {
                            var positionPart = part;
                            sub.style.position = "absolute";
                            sub.style.left = (_this._scaleX * positionPart.x).toFixed(3) + "px";
                            sub.style.top = (_this._scaleY * positionPart.y).toFixed(3) + "px";
                        } else if (part instanceof libjass.parts.Move) {
                            var movePart = part;
                            sub.style.position = "absolute";
                            animationCollection.addCustom("linear", new Keyframe(0, {
                                left: (_this._scaleX * movePart.x1).toFixed(3) + "px",
                                top: (_this._scaleY * movePart.y1).toFixed(3) + "px"
                            }), new Keyframe(movePart.t1, {
                                left: (_this._scaleX * movePart.x1).toFixed(3) + "px",
                                top: (_this._scaleY * movePart.y1).toFixed(3) + "px"
                            }), new Keyframe(movePart.t2, {
                                left: (_this._scaleX * movePart.x2).toFixed(3) + "px",
                                top: (_this._scaleY * movePart.y2).toFixed(3) + "px"
                            }), new Keyframe(dialogue.end - dialogue.start, {
                                left: (_this._scaleX * movePart.x2).toFixed(3) + "px",
                                top: (_this._scaleY * movePart.y2).toFixed(3) + "px"
                            }));
                        } else if (part instanceof libjass.parts.Fade) {
                            var fadePart = part;
                            if (fadePart.start !== 0) {
                                animationCollection.addFadeIn(0, fadePart.start);
                            }
                            if (fadePart.end !== 0) {
                                animationCollection.addFadeOut(dialogue.end - dialogue.start - fadePart.end, fadePart.end);
                            }
                        } else if (part instanceof libjass.parts.ComplexFade) {
                            var complexFadePart = part;
                            animationCollection.addCustom("linear", new Keyframe(0, {
                                opacity: String(complexFadePart.a1)
                            }), new Keyframe(complexFadePart.t1, {
                                opacity: String(complexFadePart.a1)
                            }), new Keyframe(complexFadePart.t2, {
                                opacity: String(complexFadePart.a2)
                            }), new Keyframe(complexFadePart.t3, {
                                opacity: String(complexFadePart.a2)
                            }), new Keyframe(complexFadePart.t4, {
                                opacity: String(complexFadePart.a3)
                            }), new Keyframe(dialogue.end, {
                                opacity: String(complexFadePart.a3)
                            }));
                        } else if (part instanceof libjass.parts.DrawingMode) {
                            currentDrawing = new Drawing(part.scale, _this._scaleX, _this._scaleY);
                        } else if (part instanceof libjass.parts.DrawingBaselineOffset) {
                            currentDrawing.baselineOffset = part.value;
                        } else if (part instanceof libjass.parts.DrawingInstructions) {
                            currentDrawing.instructions = part.instructions;
                            currentSpan.appendChild(currentDrawing.toSVG());
                            currentDrawing = null;
                            startNewSpan();
                        } else if (part instanceof libjass.parts.Text || libjass.debugMode && part instanceof libjass.parts.Comment) {
                            currentSpan.appendChild(document.createTextNode(part.value));
                            startNewSpan();
                        }
                    });
                    var transformOriginParts = DefaultRenderer._getTransformOrigin(dialogue);
                    dialogue.parts.some(function(part) {
                        if (part instanceof libjass.parts.Position || part instanceof libjass.parts.Move) {
                            var translateX = -transformOriginParts[0];
                            var translateY = -transformOriginParts[1];
                            divTransformStyle = "translate(" + translateX + "%, " + translateY + "%) translate(-" + sub.style.marginLeft + ", -" + sub.style.marginTop + ") " + divTransformStyle;
                            return true;
                        }
                        return false;
                    });
                    if (divTransformStyle !== "") {
                        var transformOriginString = transformOriginParts[0] + "% " + transformOriginParts[1] + "%";
                        sub.style.webkitTransform = divTransformStyle;
                        sub.style.webkitTransformOrigin = transformOriginString;
                        sub.style.transform = divTransformStyle;
                        sub.style.transformOrigin = transformOriginString;
                    }
                    if (this._animationStyleElement === null) {
                        this._animationStyleElement = document.createElement("style");
                        this._animationStyleElement.id = "libjass-animation-styles-" + this.id;
                        this._animationStyleElement.type = "text/css";
                        document.querySelector("head").appendChild(this._animationStyleElement);
                    }
                    this._animationStyleElement.appendChild(document.createTextNode(animationCollection.cssText));
                    sub.style.webkitAnimation = animationCollection.animationStyle;
                    sub.style.animation = animationCollection.animationStyle;
                    sub.setAttribute("data-dialogue-id", this.id + "-" + dialogue.id);
                    this._preRenderedSubs.set(dialogue.id, sub);
                };
                /**
                 * Returns the subtitle div for display. The currentTime is used to shift the animations appropriately, so that at the time the
                 * div is inserted into the DOM and the animations begin, they are in sync with the video time.
                 *
                 * @param {!libjass.Dialogue} dialogue
                 */
                DefaultRenderer.prototype.draw = function(dialogue) {
                    var _this = this;
                    if (this._currentSubs.has(dialogue.id)) {
                        return;
                    }
                    if (libjass.debugMode) {
                        console.log(dialogue.toString());
                    }
                    var preRenderedSub = this._preRenderedSubs.get(dialogue.id);
                    if (preRenderedSub === undefined) {
                        if (libjass.debugMode) {
                            console.warn("This dialogue was not pre-rendered. Call preRender() before calling draw() so that draw() is faster.");
                        }
                        this.preRender(dialogue);
                        preRenderedSub = this._preRenderedSubs.get(dialogue.id);
                        if (libjass.debugMode) {
                            console.log(dialogue.toString());
                        }
                    }
                    var result = preRenderedSub.cloneNode(true);
                    var defaultAnimationDelay = result.style.webkitAnimationDelay;
                    if (defaultAnimationDelay === undefined) {
                        defaultAnimationDelay = result.style.animationDelay;
                    }
                    if (defaultAnimationDelay !== "") {
                        var animationDelay = defaultAnimationDelay.split(",").map(function(delay) {
                            return (parseFloat(delay) + dialogue.start - _this.currentTime).toFixed(3) + "s";
                        }).join(",");
                        result.style.webkitAnimationDelay = animationDelay;
                        result.style.animationDelay = animationDelay;
                    }
                    var layer = dialogue.layer;
                    var alignment = result.style.position === "absolute" ? 0 : dialogue.alignment;
                    // Create the layer wrapper div and the alignment div inside it if not already created
                    if (this._layerAlignmentWrappers[layer] === undefined) {
                        this._layerAlignmentWrappers[layer] = new Array(9 + 1);
                    }
                    if (this._layerAlignmentWrappers[layer][alignment] === undefined) {
                        var layerAlignmentWrapper = document.createElement("div");
                        layerAlignmentWrapper.className = "layer" + layer + " an" + alignment;
                        // Find the next greater layer,alignment div and insert this div before that one
                        var insertBeforeElement = null;
                        for (var insertBeforeLayer = layer; insertBeforeLayer < this._layerAlignmentWrappers.length && insertBeforeElement === null; insertBeforeLayer++) {
                            if (this._layerAlignmentWrappers[insertBeforeLayer] !== undefined) {
                                for (var insertBeforeAlignment = insertBeforeLayer === layer ? alignment + 1 : 0; insertBeforeAlignment < 10 && insertBeforeElement === null; insertBeforeAlignment++) {
                                    if (this._layerAlignmentWrappers[insertBeforeLayer][insertBeforeAlignment] !== undefined) {
                                        insertBeforeElement = this._layerAlignmentWrappers[insertBeforeLayer][insertBeforeAlignment];
                                    }
                                }
                            }
                        }
                        this._subsWrapper.insertBefore(layerAlignmentWrapper, insertBeforeElement);
                        this._layerAlignmentWrappers[layer][alignment] = layerAlignmentWrapper;
                    }
                    this._layerAlignmentWrappers[layer][alignment].appendChild(result);
                    this._currentSubs.set(dialogue.id, result);
                };
                DefaultRenderer.prototype._ready = function() {
                    var _this = this;
                    document.addEventListener("webkitfullscreenchange", function() {
                        return _this._onFullScreenChange();
                    }, false);
                    document.addEventListener("mozfullscreenchange", function() {
                        return _this._onFullScreenChange();
                    }, false);
                    document.addEventListener("fullscreenchange", function() {
                        return _this._onFullScreenChange();
                    }, false);
                    this.resizeVideo(this.video.offsetWidth, this.video.offsetHeight);
                    this._dispatchEvent("ready");
                };
                DefaultRenderer.prototype._onFullScreenChange = function() {
                    var fullScreenElement = document.fullscreenElement;
                    if (fullScreenElement === undefined) {
                        fullScreenElement = document.mozFullScreenElement;
                    }
                    if (fullScreenElement === undefined) {
                        fullScreenElement = document.msFullscreenElement;
                    }
                    if (fullScreenElement === undefined) {
                        fullScreenElement = document.webkitFullscreenElement;
                    }
                    if (fullScreenElement === this.video) {
                        this._videoSubsWrapper.classList.add("libjass-full-screen");
                        this.resizeVideo(screen.width, screen.height);
                        this._videoIsFullScreen = true;
                        this._dispatchEvent("fullScreenChange", this._videoIsFullScreen);
                    } else if (fullScreenElement === null && this._videoIsFullScreen) {
                        this._videoSubsWrapper.classList.remove("libjass-full-screen");
                        this._videoIsFullScreen = false;
                        this._dispatchEvent("fullScreenChange", this._videoIsFullScreen);
                    }
                };
                /**
                 * @param {string} type
                 * @param {...*} args
                 *
                 * @private
                 */
                DefaultRenderer.prototype._dispatchEvent = function(type) {
                    var args = [];
                    for (var _i = 0; _i < arguments.length - 1; _i++) {
                        args[_i] = arguments[_i + 1];
                    }
                    var _this = this;
                    var listeners = this._eventListeners.get(type);
                    if (listeners !== null) {
                        listeners.forEach(function(listener) {
                            listener.apply(_this, args);
                        });
                    }
                };
                DefaultRenderer.prototype._removeSub = function(sub) {
                    sub.parentNode.removeChild(sub);
                };
                DefaultRenderer.prototype._removeAllSubs = function() {
                    var _this = this;
                    this._currentSubs.forEach(function(sub) {
                        return _this._removeSub(sub);
                    });
                    this._currentSubs.clear();
                };
                DefaultRenderer._getTransformOrigin = function(dialogue) {
                    var transformOriginX;
                    var transformOriginY;
                    switch (dialogue.alignment) {
                      case 1:
                        transformOriginX = 0;
                        transformOriginY = 100;
                        break;

                      case 2:
                        transformOriginX = 50;
                        transformOriginY = 100;
                        break;

                      case 3:
                        transformOriginX = 100;
                        transformOriginY = 100;
                        break;

                      case 4:
                        transformOriginX = 0;
                        transformOriginY = 50;
                        break;

                      case 5:
                        transformOriginX = 50;
                        transformOriginY = 50;
                        break;

                      case 6:
                        transformOriginX = 100;
                        transformOriginY = 50;
                        break;

                      case 7:
                        transformOriginX = 0;
                        transformOriginY = 0;
                        break;

                      case 8:
                        transformOriginX = 50;
                        transformOriginY = 0;
                        break;

                      case 9:
                        transformOriginX = 100;
                        transformOriginY = 0;
                        break;
                    }
                    return [ transformOriginX, transformOriginY ];
                };
                return DefaultRenderer;
            }(NullRenderer);
            renderers.DefaultRenderer = DefaultRenderer;
            /**
             * Settings for the default renderer.
             *
             * @constructor
             *
             * @memberof libjass.renderers
             */
            var RendererSettings = function() {
                function RendererSettings() {}
                /**
                 * A convenience method to create a font map from a <style> or <link> element that contains @font-face rules.
                 *
                 * @param {!LinkStyle} linkStyle
                 * @return {!Map<string, string[]>}
                 *
                 * @static
                 */
                RendererSettings.makeFontMapFromStyleElement = function(linkStyle) {
                    var map = new libjass.Map();
                    var styleSheet = linkStyle.sheet;
                    var rules = Array.prototype.filter.call(styleSheet.cssRules, function(rule) {
                        return rule.type === CSSRule.FONT_FACE_RULE;
                    });
                    rules.forEach(function(rule) {
                        var src = rule.style.getPropertyValue("src");
                        var urls = [];
                        if (!src) {
                            src = rule.cssText.split("\n").map(function(line) {
                                return line.match(/src: ([^;]+);/);
                            }).filter(function(matches) {
                                return matches !== null;
                            }).map(function(matches) {
                                return matches[1];
                            })[0];
                        }
                        urls = src.split(/,\s*/).map(function(url) {
                            return url.match(/^url\((.+)\)$/)[1];
                        });
                        if (urls.length > 0) {
                            var name = RendererSettings._stripQuotes(rule.style.getPropertyValue("font-family"));
                            var existingList = map.get(name);
                            if (existingList === undefined) {
                                existingList = [];
                                map.set(name, existingList);
                            }
                            existingList.unshift.apply(existingList, urls.map(RendererSettings._stripQuotes));
                        }
                    });
                    return map;
                };
                /**
                 * Converts an arbitrary object into a RendererSettings object.
                 *
                 * @param {!*} object
                 * @return {!libjass.renderers.RendererSettings}
                 *
                 * @static
                 */
                RendererSettings.from = function(object) {
                    return RendererSettings._from(object.fontMap, object.preRenderTime);
                };
                RendererSettings._from = function(fontMap, preRenderTime) {
                    if (typeof fontMap === "undefined") {
                        fontMap = null;
                    }
                    if (typeof preRenderTime === "undefined") {
                        preRenderTime = 5;
                    }
                    var result = new RendererSettings();
                    result.fontMap = fontMap;
                    result.preRenderTime = preRenderTime;
                    return result;
                };
                RendererSettings._stripQuotes = function(str) {
                    return str.match(/^["']?(.*?)["']?$/)[1];
                };
                return RendererSettings;
            }();
            renderers.RendererSettings = RendererSettings;
            /**
             * This class represents a single keyframe. It has a list of CSS properties (names and values) associated with a point in time. Multiple keyframes make up an animation.
             *
             * @param {number} time
             * @param {!Object.<string, string>} properties
             *
             * @private
             * @memberof libjass.renderers
             */
            var Keyframe = function() {
                function Keyframe(time, properties) {
                    this._time = time;
                    this._properties = properties;
                }
                Object.defineProperty(Keyframe.prototype, "time", {
                    /**
                     * @type {number}
                     */
                    get: function() {
                        return this._time;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Keyframe.prototype, "properties", {
                    /**
                     * @type {!Object.<string, string>}
                     */
                    get: function() {
                        return this._properties;
                    },
                    enumerable: true,
                    configurable: true
                });
                return Keyframe;
            }();
            /**
             * This class represents a collection of animations. Each animation contains one or more keyframes.
             * The collection can then be converted to a CSS3 representation.
             *
             * @constructor
             * @param {!libjass.renderers.NullRenderer} renderer The renderer that this collection is associated with
             * @param {!libjass.Dialogue} dialogue The Dialogue that this collection is associated with
             *
             * @private
             * @memberof libjass.renderers
             */
            var AnimationCollection = function() {
                function AnimationCollection(renderer, dialogue) {
                    this._cssText = "";
                    this._animationStyle = "";
                    this._numAnimations = 0;
                    this._id = renderer.id + "-" + dialogue.id;
                    this._start = dialogue.start;
                    this._end = dialogue.end;
                }
                Object.defineProperty(AnimationCollection.prototype, "cssText", {
                    /**
                     * This string contains the animation definitions and should be inserted into a <style> element.
                     *
                     * @type {string}
                     */
                    get: function() {
                        return this._cssText;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(AnimationCollection.prototype, "animationStyle", {
                    /**
                     * This string should be set as the "animation" CSS property of the target element.
                     *
                     * @type {string}
                     */
                    get: function() {
                        return this._animationStyle;
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * Add a fade-in animation to this collection.
                 *
                 * @param {number} start The time from the dialogue start to start the fade-in
                 * @param {number} duration The duration of the fade-in
                 */
                AnimationCollection.prototype.addFadeIn = function(start, duration) {
                    if (this._animationStyle !== "") {
                        this._animationStyle += ",";
                    }
                    this._animationStyle += "fade-in " + duration.toFixed(3) + "s linear " + start.toFixed(3) + "s";
                };
                /**
                 * Add a fade-out animation to this collection.
                 *
                 * @param {number} start The time from the dialogue start to start the fade-out
                 * @param {number} duration The duration of the fade-out
                 */
                AnimationCollection.prototype.addFadeOut = function(start, duration) {
                    if (this._animationStyle !== "") {
                        this._animationStyle += ",";
                    }
                    this._animationStyle += "fade-out " + duration.toFixed(3) + "s linear " + start.toFixed(3) + "s";
                };
                /**
                 * Add a custom animation to this collection. The given keyframes together make one animation.
                 *
                 * @param {string} timingFunction One of the acceptable values for the "animation-timing-function" CSS property
                 * @param {Array.<!{time: number, properties: !Object.<string, string>}>} keyframes
                 */
                AnimationCollection.prototype.addCustom = function(timingFunction) {
                    var keyframes = [];
                    for (var _i = 0; _i < arguments.length - 1; _i++) {
                        keyframes[_i] = arguments[_i + 1];
                    }
                    var _this = this;
                    var startTime = null;
                    var endTime = null;
                    var ruleCssText = "";
                    keyframes.forEach(function(keyframe) {
                        if (startTime === null) {
                            startTime = keyframe.time;
                        }
                        endTime = keyframe.time;
                        ruleCssText += "	" + (100 * keyframe.time / (_this._end - _this._start)).toFixed(3) + "% {\n";
                        Object.keys(keyframe.properties).forEach(function(propertyName) {
                            ruleCssText += "		" + propertyName + ": " + keyframe.properties[propertyName] + ";\n";
                        });
                        ruleCssText += "	}\n";
                    });
                    var animationName = "dialogue-" + this._id + "-" + this._numAnimations++;
                    this._cssText += "@-webkit-keyframes " + animationName + " {\n" + ruleCssText + "}\n\n" + "@keyframes " + animationName + " {\n" + ruleCssText + "}\n\n";
                    if (this._animationStyle !== "") {
                        this._animationStyle += ",";
                    }
                    this._animationStyle += animationName + " " + (endTime - startTime).toFixed(3) + "s " + timingFunction + " " + startTime.toFixed(3) + "s";
                };
                return AnimationCollection;
            }();
            /**
             * This class represents the style attribute of a span.
             * As a Dialogue's div is rendered, individual parts are added to span's, and this class is used to maintain the style attribute of those.
             *
             * @constructor
             * @param {!libjass.renderers.NullRenderer} renderer The renderer that this set of styles is associated with
             * @param {!libjass.Dialogue} dialogue The Dialogue that this set of styles is associated with
             * @param {number} scaleX The horizontal scaling of the subtitles
             * @param {number} scaleY The vertical scaling of the subtitles
             * @param {!SVGDefsElement} svgDefsElement An SVG <defs> element to append filter definitions to
             *
             * @private
             * @memberof libjass.renderers
             */
            var SpanStyles = function() {
                function SpanStyles(renderer, dialogue, scaleX, scaleY, svgDefsElement) {
                    this._scaleX = scaleX;
                    this._scaleY = scaleY;
                    this._svgDefsElement = svgDefsElement;
                    this._nextFilterId = 0;
                    this._id = renderer.id + "-" + dialogue.id;
                    this._defaultStyle = dialogue.style;
                    this.reset(null);
                }
                /**
                 * Resets the styles to the defaults provided by the argument.
                 *
                 * @param {libjass.Style} newStyle The new defaults to reset the style to. If null, the styles are reset to the default style of the Dialogue.
                 */
                SpanStyles.prototype.reset = function(newStyle) {
                    if (newStyle === undefined || newStyle === null) {
                        newStyle = this._defaultStyle;
                    }
                    this.italic = newStyle.italic;
                    this.bold = newStyle.bold;
                    this.underline = newStyle.underline;
                    this.strikeThrough = newStyle.strikeThrough;
                    this.outlineWidth = newStyle.outlineThickness;
                    this.outlineHeight = newStyle.outlineThickness;
                    this.shadowDepthX = newStyle.shadowDepth;
                    this.shadowDepthY = newStyle.shadowDepth;
                    this.fontName = newStyle.fontName;
                    this.fontSize = newStyle.fontSize;
                    this.fontScaleX = newStyle.fontScaleX;
                    this.fontScaleY = newStyle.fontScaleY;
                    this.letterSpacing = newStyle.letterSpacing;
                    this.primaryColor = newStyle.primaryColor;
                    this.outlineColor = newStyle.outlineColor;
                    this.shadowColor = newStyle.shadowColor;
                    this.primaryAlpha = null;
                    this.outlineAlpha = null;
                    this.shadowAlpha = null;
                    this.blur = null;
                };
                /**
                 * Sets the style attribute on the given span element.
                 *
                 * @param {!HTMLSpanElement} span
                 * @return {!HTMLSpanElement} The resulting <span> with the CSS styles applied. This may be a wrapper around the input <span> if the styles were applied using SVG filters.
                 */
                SpanStyles.prototype.setStylesOnSpan = function(span) {
                    var fontStyleOrWeight = "";
                    if (this._italic) {
                        fontStyleOrWeight += "italic ";
                    }
                    if (this._bold === true) {
                        fontStyleOrWeight += "bold ";
                    } else if (this._bold !== false) {
                        fontStyleOrWeight += this._bold + " ";
                    }
                    var fontSize = (72 / 96 * this._scaleY * this._fontSize).toFixed(3);
                    span.style.font = fontStyleOrWeight + fontSize + "px/" + fontSize + 'px "' + this._fontName + '"';
                    var textDecoration = "";
                    if (this._underline) {
                        textDecoration = "underline";
                    }
                    if (this._strikeThrough) {
                        textDecoration += " line-through";
                    }
                    span.style.textDecoration = textDecoration.trim();
                    var transform = "";
                    if (this._fontScaleX !== 1) {
                        transform += "scaleX(" + this._fontScaleX + ") ";
                    }
                    if (this._fontScaleY !== 1) {
                        transform += "scaleY(" + this._fontScaleY + ")";
                    }
                    if (transform !== "") {
                        span.style.webkitTransform = transform;
                        span.style.webkitTransformOrigin = "50% 50%";
                        span.style.transform = transform;
                        span.style.transformOrigin = "50% 50%";
                        span.style.display = "inline-block";
                    }
                    span.style.letterSpacing = (this._scaleX * this._letterSpacing).toFixed(3) + "px";
                    var primaryColor = this._primaryColor.withAlpha(this._primaryAlpha);
                    span.style.color = primaryColor.toString();
                    var outlineColor = this._outlineColor.withAlpha(this._outlineAlpha);
                    var outlineWidth = this._scaleX * this._outlineWidth;
                    var outlineHeight = this._scaleY * this._outlineHeight;
                    var filterId = "svg-filter-" + this._id + "-" + this._nextFilterId++;
                    var points = [];
                    var outlineColorFilter = '	<feComponentTransfer in="SourceAlpha" result="outlineColor">\n' + '		<feFuncR type="linear" slope="0" intercept="' + (outlineColor.red / 255).toFixed(3) + '" />\n' + '		<feFuncG type="linear" slope="0" intercept="' + (outlineColor.green / 255).toFixed(3) + '" />\n' + '		<feFuncB type="linear" slope="0" intercept="' + (outlineColor.blue / 255).toFixed(3) + '" />\n' + '		<feFuncA type="linear" slope="' + outlineColor.alpha.toFixed(3) + '" intercept="0" />\n' + "	</feComponentTransfer>\n";
                    var outlineFilter = "";
                    if (outlineWidth > 0 || outlineHeight > 0) {
                        /* Lay out outlines in an ellipse with horizontal radius = (this._scaleX * this._outlineWidth) and vertical radius = (this._scaleY * this._outlineHeight)
                         * Outlines are laid inside the region of the ellipse, separated by 1 pixel horizontally and vertically.
                         *
                         * The below loop is an unrolled version of the above algorithm that only roams over one quadrant and adds
                         * four shadows at a time.
                         */
                        var a = outlineWidth - 1;
                        var b = outlineHeight - 1;
                        for (var x = 0; x < a; x++) {
                            for (var y = 0; x / a * (x / a) + y / b * (y / b) <= 1; y++) {
                                if (x === 0 && y === 0) {
                                    continue;
                                }
                                points.push([ x, y ]);
                                if (x !== 0) {
                                    points.push([ -x, y ]);
                                }
                                if (x !== 0 && y !== 0) {
                                    points.push([ -x, -y ]);
                                }
                                if (y !== 0) {
                                    points.push([ x, -y ]);
                                }
                            }
                        }
                        // Add the four corner outlines
                        points.push([ a, 0 ]);
                        points.push([ 0, b ]);
                        points.push([ -a, 0 ]);
                        points.push([ 0, -b ]);
                        var mergeOutlinesFilter = "";
                        points.forEach(function(pair, index) {
                            outlineFilter += '	<feOffset dx="' + pair[0].toFixed(3) + '" dy="' + pair[1].toFixed(3) + '" in="outlineColor" result="outline' + index + '" />\n';
                            mergeOutlinesFilter += '		<feMergeNode in="outline' + index + '" />\n';
                        });
                        outlineFilter += "	<feMerge>\n" + mergeOutlinesFilter + "	</feMerge>\n";
                    }
                    var blurFilter = "";
                    if (this._blur > 0) {
                        blurFilter = '	<feGaussianBlur stdDeviation="' + this._blur + '" />\n';
                    }
                    var filterWrapperSpan = document.createElement("span");
                    filterWrapperSpan.appendChild(span);
                    if (outlineFilter !== "" || blurFilter !== "") {
                        var filterString = '<filter xmlns="http://www.w3.org/2000/svg" id="' + filterId + '">\n' + outlineColorFilter + outlineFilter + blurFilter + "	<feMerge>\n" + "		<feMergeNode />\n" + '		<feMergeNode in="SourceGraphic" />\n' + "	</feMerge>\n" + "</filter>\n";
                        var filterElement = domParser.parseFromString(filterString, "image/svg+xml").childNodes[0];
                        this._svgDefsElement.appendChild(filterElement);
                        filterWrapperSpan.style.webkitFilter = 'url("#' + filterId + '")';
                        filterWrapperSpan.style.filter = 'url("#' + filterId + '")';
                    }
                    var shadowColor = this._shadowColor.withAlpha(this._shadowAlpha);
                    span.style.textShadow = shadowColor.toString() + " " + (this._shadowDepthX * this._scaleX / this._fontScaleX).toFixed(3) + "px " + (this._shadowDepthY * this._scaleY / this._fontScaleY).toFixed(3) + "px 0px";
                    return filterWrapperSpan;
                };
                Object.defineProperty(SpanStyles.prototype, "italic", {
                    /**
                     * Sets the italic property. null defaults it to the default style's value.
                     *
                     * @type {?boolean}
                     */
                    set: function(value) {
                        this._italic = SpanStyles._valueOrDefault(value, this._defaultStyle.italic);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SpanStyles.prototype, "bold", {
                    /**
                     * Sets the bold property. null defaults it to the default style's value.
                     *
                     * @type {(?number|?boolean)}
                     */
                    set: function(value) {
                        this._bold = SpanStyles._valueOrDefault(value, this._defaultStyle.bold);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SpanStyles.prototype, "underline", {
                    /**
                     * Sets the underline property. null defaults it to the default style's value.
                     *
                     * @type {?boolean}
                     */
                    set: function(value) {
                        this._underline = SpanStyles._valueOrDefault(value, this._defaultStyle.underline);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SpanStyles.prototype, "strikeThrough", {
                    /**
                     * Sets the strike-through property. null defaults it to the default style's value.
                     *
                     * @type {?boolean}
                     */
                    set: function(value) {
                        this._strikeThrough = SpanStyles._valueOrDefault(value, this._defaultStyle.strikeThrough);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SpanStyles.prototype, "outlineWidth", {
                    /**
                     * Sets the outline width property. null defaults it to the style's original outline width value.
                     *
                     * @type {?number}
                     */
                    set: function(value) {
                        this._outlineWidth = SpanStyles._valueOrDefault(value, this._defaultStyle.outlineThickness);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SpanStyles.prototype, "outlineHeight", {
                    /**
                     * Sets the outline height property. null defaults it to the style's original outline height value.
                     *
                     * @type {?number}
                     */
                    set: function(value) {
                        this._outlineHeight = SpanStyles._valueOrDefault(value, this._defaultStyle.outlineThickness);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SpanStyles.prototype, "shadowDepthX", {
                    /**
                     * Sets the outline width property. null defaults it to the style's original shadow depth X value.
                     *
                     * @type {?number}
                     */
                    set: function(value) {
                        this._shadowDepthX = SpanStyles._valueOrDefault(value, this._defaultStyle.shadowDepth);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SpanStyles.prototype, "shadowDepthY", {
                    /**
                     * Sets the shadow height property. null defaults it to the style's original shadow depth Y value.
                     *
                     * @type {?number}
                     */
                    set: function(value) {
                        this._shadowDepthY = SpanStyles._valueOrDefault(value, this._defaultStyle.shadowDepth);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SpanStyles.prototype, "blur", {
                    /**
                     * Sets the blur property. null defaults it to 0.
                     *
                     * @type {?number}
                     */
                    set: function(value) {
                        this._blur = SpanStyles._valueOrDefault(value, 0);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SpanStyles.prototype, "fontName", {
                    /**
                     * Sets the font name property. null defaults it to the default style's value.
                     *
                     * @type {?string}
                     */
                    set: function(value) {
                        this._fontName = SpanStyles._valueOrDefault(value, this._defaultStyle.fontName);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SpanStyles.prototype, "fontSize", {
                    /**
                     * Sets the font size property. null defaults it to the default style's value.
                     *
                     * @type {?number}
                     */
                    set: function(value) {
                        this._fontSize = SpanStyles._valueOrDefault(value, this._defaultStyle.fontSize);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SpanStyles.prototype, "fontScaleX", {
                    /**
                     * Sets the horizontal font scaling property. null defaults it to the default style's value.
                     *
                     * @type {?number}
                     */
                    set: function(value) {
                        this._fontScaleX = SpanStyles._valueOrDefault(value, this._defaultStyle.fontScaleX);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SpanStyles.prototype, "fontScaleY", {
                    /**
                     * Sets the vertical font scaling property. null defaults it to the default style's value.
                     *
                     * @type {?number}
                     */
                    set: function(value) {
                        this._fontScaleY = SpanStyles._valueOrDefault(value, this._defaultStyle.fontScaleY);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SpanStyles.prototype, "letterSpacing", {
                    /**
                     * Sets the letter spacing property. null defaults it to the default style's value.
                     *
                     * @type {?number}
                     */
                    set: function(value) {
                        this._letterSpacing = SpanStyles._valueOrDefault(value, this._defaultStyle.letterSpacing);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SpanStyles.prototype, "primaryColor", {
                    /**
                     * Sets the primary color property. null defaults it to the default style's value.
                     *
                     * @type {libjass.parts.Color}
                     */
                    set: function(value) {
                        this._primaryColor = SpanStyles._valueOrDefault(value, this._defaultStyle.primaryColor);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SpanStyles.prototype, "outlineColor", {
                    /**
                     * Sets the outline color property. null defaults it to the default style's value.
                     *
                     * @type {libjass.parts.Color}
                     */
                    set: function(value) {
                        this._outlineColor = SpanStyles._valueOrDefault(value, this._defaultStyle.outlineColor);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SpanStyles.prototype, "shadowColor", {
                    /**
                     * Sets the shadow color property. null defaults it to the default style's value.
                     *
                     * @type {libjass.parts.Color}
                     */
                    set: function(value) {
                        this._shadowColor = SpanStyles._valueOrDefault(value, this._defaultStyle.shadowColor);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SpanStyles.prototype, "primaryAlpha", {
                    /**
                     * Sets the primary alpha property.
                     *
                     * @type {?number}
                     */
                    set: function(value) {
                        this._primaryAlpha = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SpanStyles.prototype, "outlineAlpha", {
                    /**
                     * Sets the outline alpha property.
                     *
                     * @type {?number}
                     */
                    set: function(value) {
                        this._outlineAlpha = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SpanStyles.prototype, "shadowAlpha", {
                    /**
                     * Sets the shadow alpha property.
                     *
                     * @type {?number}
                     */
                    set: function(value) {
                        this._shadowAlpha = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                SpanStyles._valueOrDefault = function(newValue, defaultValue) {
                    return newValue !== null ? newValue : defaultValue;
                };
                return SpanStyles;
            }();
            /**
             * This class represents an ASS drawing - a set of drawing instructions between {\p} tags.
             *
             * @param {number} drawingScale
             * @param {number} scaleX
             * @param {number} scaleY
             *
             * @private
             * @memberof libjass.renderers
             */
            var Drawing = function() {
                function Drawing(drawingScale, scaleX, scaleY) {
                    this._baselineOffset = 0;
                    this._instructions = [];
                    var scaleFactor = Math.pow(2, drawingScale - 1);
                    this._scaleX = scaleX / scaleFactor;
                    this._scaleY = scaleY / scaleFactor;
                }
                Object.defineProperty(Drawing.prototype, "baselineOffset", {
                    /**
                     * @type {number}
                     */
                    set: function(value) {
                        this._baselineOffset = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Drawing.prototype, "instructions", {
                    /**
                     * @type {!Array.<!libjass.parts.drawing.Instruction>}
                     */
                    set: function(value) {
                        this._instructions = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * Converts this drawing to an <svg> element.
                 *
                 * @return {!SVGSVGElement}
                 */
                Drawing.prototype.toSVG = function() {
                    var _this = this;
                    var path = "";
                    var bboxWidth = 0;
                    var bboxHeight = 0;
                    this._instructions.forEach(function(instruction) {
                        if (instruction instanceof libjass.parts.drawing.MoveInstruction) {
                            var movePart = instruction;
                            path += " M " + movePart.x + " " + (movePart.y + _this._baselineOffset);
                            bboxWidth = Math.max(bboxWidth, movePart.x);
                            bboxHeight = Math.max(bboxHeight, movePart.y + _this._baselineOffset);
                        } else if (instruction instanceof libjass.parts.drawing.LineInstruction) {
                            var linePart = instruction;
                            path += " L " + linePart.x + " " + (linePart.y + _this._baselineOffset);
                            bboxWidth = Math.max(bboxWidth, linePart.x);
                            bboxHeight = Math.max(bboxHeight, linePart.y + _this._baselineOffset);
                        } else if (instruction instanceof libjass.parts.drawing.CubicBezierCurveInstruction) {
                            var cubicBezierCurvePart = instruction;
                            path += " C " + cubicBezierCurvePart.x1 + " " + (cubicBezierCurvePart.y1 + _this._baselineOffset) + ", " + cubicBezierCurvePart.x2 + " " + (cubicBezierCurvePart.y2 + _this._baselineOffset) + ", " + cubicBezierCurvePart.x3 + " " + (cubicBezierCurvePart.y3 + _this._baselineOffset);
                            bboxWidth = Math.max(bboxWidth, cubicBezierCurvePart.x1, cubicBezierCurvePart.x2, cubicBezierCurvePart.x3);
                            bboxHeight = Math.max(bboxHeight, cubicBezierCurvePart.y1 + _this._baselineOffset, cubicBezierCurvePart.y2 + _this._baselineOffset, cubicBezierCurvePart.y3 + _this._baselineOffset);
                        }
                    });
                    var result = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + (bboxWidth * this._scaleX).toFixed(3) + 'px" height="' + (bboxHeight * this._scaleY).toFixed(3) + 'px">\n' + '	<g transform="scale(' + this._scaleX.toFixed(3) + " " + this._scaleY.toFixed(3) + ')">\n' + '		<path d="' + path + '" />\n' + "	</g>\n" + "</svg>";
                    return domParser.parseFromString(result, "image/svg+xml").childNodes[0];
                };
                return Drawing;
            }();
            var domParser;
            if (typeof DOMParser !== "undefined") {
                domParser = new DOMParser();
            }
        })(libjass.renderers || (libjass.renderers = {}));
    })(libjass || (libjass = {}));
    (function(libjass) {
        /**
         * This class represents an ASS script. It contains the script properties, an array of Styles, and an array of Dialogues.
         *
         * @constructor
         *
         * @memberof libjass
         */
        var ASS = function() {
            function ASS() {
                this._properties = new ScriptProperties();
                this._styles = Object.create(null);
                this._dialogues = [];
                // Deprecated constructor argument
                if (arguments.length === 1) {
                    throw new Error("Constructor `new ASS(rawASS)` has been deprecated. Use `ASS.fromString(rawASS)` instead.");
                }
            }
            Object.defineProperty(ASS.prototype, "properties", {
                /**
                 * The properties of this script.
                 *
                 * @type {!libjass.ScriptProperties}
                 */
                get: function() {
                    return this._properties;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ASS.prototype, "styles", {
                /**
                 * The styles in this script.
                 *
                 * @type {!Object.<string, !libjass.Style>}
                 */
                get: function() {
                    return this._styles;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ASS.prototype, "dialogues", {
                /**
                 * The dialogues in this script.
                 *
                 * @type {!Array.<!libjass.Dialogue>}
                 */
                get: function() {
                    return this._dialogues;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Creates an ASS object from the raw text of an ASS script.
             *
             * @param {string} rawASS The raw text of the ASS script.
             * @return {!libjass.ASS}
             *
             * @static
             */
            ASS.fromString = function(rawASS) {
                rawASS = rawASS.replace(/\r$/gm, "");
                var script = libjass.parser.parse(rawASS, "script");
                var result = new ASS();
                // Get the script info template
                var infoTemplate = script["Script Info"];
                if (libjass.verboseMode) {
                    console.log("Read script info: " + JSON.stringify(infoTemplate), infoTemplate);
                }
                // Parse the horizontal script resolution
                result.properties.resolutionX = parseInt(infoTemplate["PlayResX"]);
                // Parse the vertical script resolution
                result.properties.resolutionY = parseInt(infoTemplate["PlayResY"]);
                // Get styles from the styles section
                script["V4+ Styles"].forEach(function(line) {
                    if (line.type === "Style") {
                        var styleTemplate = line.template;
                        if (libjass.verboseMode) {
                            console.log("Read style: " + JSON.stringify(styleTemplate), styleTemplate);
                        }
                        // Create the style and add it to the styles map
                        var newStyle = new Style(styleTemplate);
                        result.styles[newStyle.name] = newStyle;
                    }
                });
                // Get dialogues from the events section
                script["Events"].forEach(function(line) {
                    if (line.type === "Dialogue") {
                        var dialogueTemplate = line.template;
                        if (libjass.verboseMode) {
                            console.log("Read dialogue: " + JSON.stringify(dialogueTemplate), dialogueTemplate);
                        }
                        // Create the dialogue and add it to the dialogues array
                        result.dialogues.push(new Dialogue(dialogueTemplate, result));
                    }
                });
                return result;
            };
            return ASS;
        }();
        libjass.ASS = ASS;
        /**
         * This class represents the properties of an ASS script.
         *
         * @constructor
         *
         * @memberof libjass
         */
        var ScriptProperties = function() {
            function ScriptProperties() {}
            Object.defineProperty(ScriptProperties.prototype, "resolutionX", {
                /**
                 * The horizontal script resolution.
                 *
                 * @type {number}
                 */
                get: function() {
                    return this._resolutionX;
                },
                /**
                 * The horizontal script resolution.
                 *
                 * @type {number}
                 */
                set: function(value) {
                    this._resolutionX = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ScriptProperties.prototype, "resolutionY", {
                /**
                 * The vertical script resolution.
                 *
                 * @type {number}
                 */
                get: function() {
                    return this._resolutionY;
                },
                /**
                 * The vertical script resolution.
                 *
                 * @type {number}
                 */
                set: function(value) {
                    this._resolutionY = value;
                },
                enumerable: true,
                configurable: true
            });
            return ScriptProperties;
        }();
        libjass.ScriptProperties = ScriptProperties;
        /**
         * This class represents a single global style declaration in an ASS script. The styles can be obtained via the ASS.styles property.
         *
         * @constructor
         * @param {!Object} template The template object that contains the style's properties. It is a map of the string values read from the ASS file.
         * @param {string} template["Name"] The name of the style
         * @param {string} template["Italic"] -1 if the style is italicized
         * @param {string} template["Bold"] -1 if the style is bold
         * @param {string} template["Underline"] -1 if the style is underlined
         * @param {string} template["StrikeOut"] -1 if the style is struck-through
         * @param {string} template["Fontname"] The name of the font
         * @param {string} template["Fontsize"] The size of the font
         * @param {string} template["ScaleX"] The horizontal scaling of the font
         * @param {string} template["ScaleY"] The vertical scaling of the font
         * @param {string} template["Spacing"] The letter spacing of the font
         * @param {string} template["PrimaryColour"] The primary color
         * @param {string} template["OutlineColour"] The outline color
         * @param {string} template["BackColour"] The shadow color
         * @param {string} template["Outline"] The outline thickness
         * @param {string} template["Shadow"] The shadow depth
         * @param {string} template["Alignment"] The alignment number
         * @param {string} template["MarginL"] The left margin
         * @param {string} template["MarginR"] The right margin
         * @param {string} template["MarginV"] The vertical margin
         *
         * @memberof libjass
         */
        var Style = function() {
            function Style(template) {
                this._name = template["Name"];
                this._italic = template["Italic"] === "-1";
                this._bold = template["Bold"] === "-1";
                this._underline = template["Underline"] === "-1";
                this._strikeThrough = template["StrikeOut"] === "-1";
                this._fontName = template["Fontname"];
                this._fontSize = parseFloat(template["Fontsize"]);
                this._fontScaleX = parseFloat(template["ScaleX"]) / 100;
                this._fontScaleY = parseFloat(template["ScaleY"]) / 100;
                this._letterSpacing = parseFloat(template["Spacing"]);
                this._primaryColor = libjass.parser.parse(template["PrimaryColour"], "colorWithAlpha");
                this._outlineColor = libjass.parser.parse(template["OutlineColour"], "colorWithAlpha");
                this._shadowColor = libjass.parser.parse(template["BackColour"], "colorWithAlpha");
                this._outlineThickness = parseFloat(template["Outline"]);
                this._shadowDepth = parseFloat(template["Shadow"]);
                this._alignment = parseInt(template["Alignment"]);
                this._marginLeft = parseFloat(template["MarginL"]);
                this._marginRight = parseFloat(template["MarginR"]);
                this._marginVertical = parseFloat(template["MarginV"]);
            }
            Object.defineProperty(Style.prototype, "name", {
                /**
                 * The name of this style.
                 *
                 * @type {string}
                 */
                get: function() {
                    return this._name;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Style.prototype, "italic", {
                /**
                 * Whether this style is italicized or not.
                 *
                 * @type {string}
                 */
                get: function() {
                    return this._italic;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Style.prototype, "bold", {
                /**
                 * Whether this style is bold or not.
                 *
                 * @type {boolean}
                 */
                get: function() {
                    return this._bold;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Style.prototype, "underline", {
                /**
                 * Whether this style is underlined or not.
                 *
                 * @type {boolean}
                 */
                get: function() {
                    return this._underline;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Style.prototype, "strikeThrough", {
                /**
                 * Whether this style is struck-through or not.
                 *
                 * @type {boolean}
                 */
                get: function() {
                    return this._strikeThrough;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Style.prototype, "fontName", {
                /**
                 * The name of this style's font.
                 *
                 * @type {string}
                 */
                get: function() {
                    return this._fontName;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Style.prototype, "fontSize", {
                /**
                 * The size of this style's font.
                 *
                 * @type {number}
                 */
                get: function() {
                    return this._fontSize;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Style.prototype, "fontScaleX", {
                /**
                 * The horizontal scaling of this style's font.
                 *
                 * @type {number}
                 */
                get: function() {
                    return this._fontScaleX;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Style.prototype, "fontScaleY", {
                /**
                 * The vertical scaling of this style's font.
                 *
                 * @type {number}
                 */
                get: function() {
                    return this._fontScaleY;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Style.prototype, "letterSpacing", {
                /**
                 * The letter spacing scaling of this style's font.
                 *
                 * @type {number}
                 */
                get: function() {
                    return this._letterSpacing;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Style.prototype, "primaryColor", {
                /**
                 * The color of this style's font.
                 *
                 * @type {!libjass.parts.Color}
                 */
                get: function() {
                    return this._primaryColor;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Style.prototype, "outlineColor", {
                /**
                 * The color of this style's outline.
                 *
                 * @type {!libjass.parts.Color}
                 */
                get: function() {
                    return this._outlineColor;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Style.prototype, "shadowColor", {
                /**
                 * The color of this style's shadow.
                 *
                 * @type {!libjass.parts.Color}
                 */
                get: function() {
                    return this._shadowColor;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Style.prototype, "outlineThickness", {
                /**
                 * The thickness of this style's outline.
                 *
                 * @type {number}
                 */
                get: function() {
                    return this._outlineThickness;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Style.prototype, "shadowDepth", {
                /**
                 * The depth of this style's shadow.
                 *
                 * @type {number}
                 */
                get: function() {
                    return this._shadowDepth;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Style.prototype, "alignment", {
                /**
                 * The alignment of dialogues of this style.
                 *
                 * @type {number}
                 */
                get: function() {
                    return this._alignment;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Style.prototype, "marginLeft", {
                /**
                 * The left margin of dialogues of this style.
                 *
                 * @type {number}
                 */
                get: function() {
                    return this._marginLeft;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Style.prototype, "marginRight", {
                /**
                 * The right margin of dialogues of this style.
                 *
                 * @type {number}
                 */
                get: function() {
                    return this._marginRight;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Style.prototype, "marginVertical", {
                /**
                 * The vertical margin of dialogues of this style.
                 *
                 * @type {number}
                 */
                get: function() {
                    return this._marginVertical;
                },
                enumerable: true,
                configurable: true
            });
            return Style;
        }();
        libjass.Style = Style;
        /**
         * This class represents a dialogue in an ASS script.
         *
         * @constructor
         * @param {!Object} template The template object that contains the dialogue's properties. It is a map of the string values read from the ASS file.
         * @param {string} template["Style"] The name of the default style of this dialogue
         * @param {string} template["Start"] The start time
         * @param {string} template["End"] The end time
         * @param {string} template["Layer"] The layer number
         * @param {string} template["Text"] The text of this dialogue
         * @param {ASS} ass The ASS object to which this dialogue belongs
         *
         * @memberof libjass
         */
        var Dialogue = function() {
            function Dialogue(template, ass) {
                this._parts = null;
                this._sub = null;
                this._id = ++Dialogue._lastDialogueId;
                this._style = ass.styles[template["Style"]];
                this._start = Dialogue._toTime(template["Start"]);
                this._end = Dialogue._toTime(template["End"]);
                this._layer = Math.max(parseInt(template["Layer"]), 0);
                this._alignment = this._style.alignment;
                this._rawPartsString = template["Text"];
            }
            Object.defineProperty(Dialogue.prototype, "id", {
                /**
                 * The unique ID of this dialogue. Auto-generated.
                 *
                 * @type {number}
                 */
                get: function() {
                    return this._id;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Dialogue.prototype, "start", {
                /**
                 * The start time of this dialogue.
                 *
                 * @type {number}
                 */
                get: function() {
                    return this._start;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Dialogue.prototype, "end", {
                /**
                 * The end time of this dialogue.
                 *
                 * @type {number}
                 */
                get: function() {
                    return this._end;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Dialogue.prototype, "style", {
                get: function() {
                    return this._style;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Dialogue.prototype, "alignment", {
                /**
                 * The alignment number of this dialogue.
                 *
                 * @type {number}
                 */
                get: function() {
                    if (this._parts === null) {
                        this._parsePartsString();
                    }
                    return this._alignment;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Dialogue.prototype, "layer", {
                /**
                 * The layer number of this dialogue.
                 *
                 * @type {number}
                 */
                get: function() {
                    return this._layer;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Dialogue.prototype, "parts", {
                /**
                 * The parts of this dialogue.
                 *
                 * @type {!Array.<!libjass.parts.Tag>}
                 */
                get: function() {
                    if (this._parts === null) {
                        this._parsePartsString();
                    }
                    return this._parts;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * @return {string} A simple representation of this dialogue's properties and tags.
             */
            Dialogue.prototype.toString = function() {
                return "#" + this._id + " [" + this._start.toFixed(3) + "-" + this._end.toFixed(3) + "] " + (this._parts !== null ? this._parts.join(", ") : this._rawPartsString);
            };
            /**
             * Parses this dialogue's parts from the raw parts string.
             */
            Dialogue.prototype._parsePartsString = function() {
                var _this = this;
                this._parts = libjass.parser.parse(this._rawPartsString, "dialogueParts");
                this._parts.forEach(function(part, index) {
                    if (part instanceof libjass.parts.Alignment) {
                        _this._alignment = part.value;
                    } else if (part instanceof libjass.parts.Move) {
                        var movePart = part;
                        if (movePart.t1 === null || movePart.t2 === null) {
                            _this._parts[index] = new libjass.parts.Move(movePart.x1, movePart.y1, movePart.x2, movePart.y2, 0, _this._end - _this._start);
                        }
                    } else if (part instanceof libjass.parts.Transform) {
                        var transformPart = part;
                        if (transformPart.start === null || transformPart.end === null || transformPart.accel === null) {
                            _this._parts[index] = new libjass.parts.Transform(transformPart.start === null ? 0 : transformPart.start, transformPart.end === null ? _this._end - _this._start : transformPart.end, transformPart.accel === null ? 1 : transformPart.accel, transformPart.tags);
                        }
                    }
                });
                if (libjass.debugMode) {
                    var possiblyIncorrectParses = this._parts.filter(function(part) {
                        return part instanceof libjass.parts.Comment && part.value.indexOf("\\") !== -1;
                    });
                    if (possiblyIncorrectParses.length > 0) {
                        console.warn("Possible incorrect parse:\n" + this._rawPartsString + "\n" + "was parsed as\n" + this.toString() + "\n" + "The possibly incorrect parses are:\n" + possiblyIncorrectParses.join("\n"));
                    }
                }
            };
            /**
             * Converts this string into the number of seconds it represents. This string must be in the form of hh:mm:ss.MMM
             *
             * @param {string} string
             * @return {number}
             *
             * @private
             * @static
             */
            Dialogue._toTime = function(str) {
                return str.split(":").reduce(function(previousValue, currentValue) {
                    return previousValue * 60 + parseFloat(currentValue);
                }, 0);
            };
            Dialogue._lastDialogueId = -1;
            return Dialogue;
        }();
        libjass.Dialogue = Dialogue;
        /**
         * Debug mode. When true, libjass logs some debug messages.
         *
         * @type {boolean}
         */
        libjass.debugMode = false;
        /**
         * Verbose debug mode. When true, libjass logs some more debug messages. This setting is independent of debugMode.
         *
         * @type {boolean}
         */
        libjass.verboseMode = false;
    })(libjass || (libjass = {}));
})(typeof module !== "undefined" && module.exports || (this.libjass = {}), typeof global !== "undefined" && global || this);
//# sourceMappingURL=libjass.js.map