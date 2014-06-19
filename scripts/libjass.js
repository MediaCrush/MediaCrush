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
         * @template T
         *
         * @constructor
         * @memberOf libjass
         * @private
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
        /**
         * Set to browser's implementation of Set if it has one, else set to libjass.SimpleSet
         *
         * @type {function(new:Set)}
         */
        libjass.Set = null;
        // Use this browser's implementation of Set if it has one
        if (global.Set !== undefined && typeof global.Set.prototype.forEach === "function") {
            libjass.Set = global.Set;
        } else {
            libjass.Set = SimpleSet;
        }
        /**
         * Map implementation for browsers that don't support it. Only supports keys which are of Number or String type, or which have a property called "id".
         *
         * Keys and values are stored as properties of an object, with property names derived from the key type.
         *
         * @template K, V
         *
         * @constructor
         * @memberOf libjass
         * @private
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
                    throw new Error("This Map implementation only supports Number and String keys, or keys with an id property.");
                }
                if (!(property in this._keys)) {
                    this._size++;
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
                    this._size--;
                }
                return result;
            };
            /**
             */
            SimpleMap.prototype.clear = function() {
                this._keys = Object.create(null);
                this._values = Object.create(null);
                this._size = 0;
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
                /**
                 * @type {number}
                 */
                get: function() {
                    return this._size;
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
                if (key.id !== undefined) {
                    return "!" + key.id;
                }
                return null;
            };
            return SimpleMap;
        }();
        /**
         * Set to browser's implementation of Map if it has one, else set to libjass.SimpleMap
         *
         * @type {function(new:Map)}
         */
        libjass.Map = null;
        // Use this browser's implementation of Map if it has one
        if (global.Map !== undefined && typeof global.Map.prototype.forEach === "function") {
            libjass.Map = global.Map;
        } else {
            libjass.Map = SimpleMap;
        }
        function mixin(derived, mixins) {
            mixins.forEach(function(mixin) {
                Object.getOwnPropertyNames(mixin.prototype).forEach(function(name) {
                    derived.prototype[name] = mixin.prototype[name];
                });
            });
        }
        libjass.mixin = mixin;
    })(libjass || (libjass = {}));
    (function(libjass) {
        (function(webworker) {
            Object.defineProperty(webworker, "supported", {
                value: typeof Worker !== "undefined",
                configurable: true,
                enumerable: true
            });
            /**
             * Create a new web worker.
             *
             * @return {!libjass.webworker.WorkerChannel} A communication channel to the new web worker.
             */
            function createWorker() {
                return new WorkerChannelImpl(new Worker(_scriptNode.src));
            }
            webworker.createWorker = createWorker;
            /**
             * The commands that can be sent to or from a web worker.
             */
            (function(WorkerCommands) {
                WorkerCommands[WorkerCommands["Response"] = 0] = "Response";
            })(webworker.WorkerCommands || (webworker.WorkerCommands = {}));
            /**
             * Registers a handler for the given worker command.
             *
             * @param {number} command The command that this handler will handle. Valid values are the values of libjass.webworker.WorkerCommands
             * @param {function(*, function(*, *))} handler The handler. A function of the form (parameters: *, response: function(error: *, result: *): void): void
             */
            function _registerWorkerCommand(command, handler) {
                workerCommands.set(command, handler);
            }
            webworker._registerWorkerCommand = _registerWorkerCommand;
            function _registerClassPrototype(prototype) {
                prototype._classTag = classPrototypes.size;
                classPrototypes.set(prototype._classTag, prototype);
            }
            webworker._registerClassPrototype = _registerClassPrototype;
            var _scriptNode = null;
            if (typeof document !== "undefined" && document.currentScript !== undefined) {
                _scriptNode = document.currentScript;
            }
            var workerCommands = new libjass.Map();
            var classPrototypes = new libjass.Map();
            /**
             * Internal implementation of libjass.webworker.WorkerChannel
             *
             * @param {!*} comm The other side of the channel. When created by the host, this is the web worker. When created by the web worker, this is its global object.
             *
             * @constructor
             * @memberOf libjass.webworker
             * @private
             */
            var WorkerChannelImpl = function() {
                function WorkerChannelImpl(comm) {
                    var _this = this;
                    this._comm = comm;
                    this._pendingRequests = new libjass.Map();
                    this._comm.addEventListener("message", function(ev) {
                        return _this._onMessage(ev.data);
                    }, false);
                }
                WorkerChannelImpl.prototype.request = function(command, parameters) {
                    var requestId = null;
                    var promise = new WorkerPromiseImpl(this);
                    var requestId = promise.id;
                    this._pendingRequests.set(requestId, promise);
                    var requestMessage = {
                        requestId: requestId,
                        command: command,
                        parameters: parameters
                    };
                    this._comm.postMessage(WorkerChannelImpl._toJSON(requestMessage));
                    return promise;
                };
                WorkerChannelImpl.prototype.cancelRequest = function(requestId) {
                    this._pendingRequests.delete(requestId);
                };
                WorkerChannelImpl.prototype._respond = function(message) {
                    this._comm.postMessage(WorkerChannelImpl._toJSON({
                        command: 0,
                        requestId: message.requestId,
                        error: message.error,
                        result: message.result
                    }));
                };
                WorkerChannelImpl.prototype._onMessage = function(message) {
                    var _this = this;
                    message = WorkerChannelImpl._fromJSON(message);
                    if (message.command === 0) {
                        var responseMessage = message;
                        var promise = this._pendingRequests.get(responseMessage.requestId);
                        if (promise !== undefined) {
                            this._pendingRequests.delete(responseMessage.requestId);
                            promise.resolve(responseMessage.error, responseMessage.result);
                        }
                        return;
                    }
                    var requestMessage = message;
                    var commandCallback = workerCommands.get(requestMessage.command);
                    if (commandCallback === undefined) {
                        this._respond({
                            requestId: requestMessage.requestId,
                            error: new Error("Unrecognized command: " + requestMessage.command),
                            result: null
                        });
                        return;
                    }
                    commandCallback(requestMessage.parameters, function(error, result) {
                        return _this._respond({
                            requestId: requestMessage.requestId,
                            error: error,
                            result: result
                        });
                    });
                };
                WorkerChannelImpl._toJSON = function(obj) {
                    return JSON.stringify(obj, function(key, value) {
                        if (value && value._classTag !== undefined) {
                            value._classTag = value._classTag;
                        }
                        return value;
                    });
                };
                WorkerChannelImpl._fromJSON = function(str) {
                    return JSON.parse(str, function(key, value) {
                        if (value && value._classTag !== undefined) {
                            var hydratedValue = Object.create(classPrototypes.get(value._classTag));
                            Object.keys(value).forEach(function(key) {
                                if (key !== "_classTag") {
                                    hydratedValue[key] = value[key];
                                }
                            });
                            value = hydratedValue;
                        }
                        return value;
                    });
                };
                return WorkerChannelImpl;
            }();
            var inWorker = typeof WorkerGlobalScope !== "undefined" && global instanceof WorkerGlobalScope;
            if (inWorker) {
                new WorkerChannelImpl(global);
            }
            var WorkerPromiseImpl = function() {
                function WorkerPromiseImpl(channel) {
                    this._channel = channel;
                    this._resolved = false;
                    this._result = null;
                    this._error = null;
                    this._callback = null;
                    this._id = ++WorkerPromiseImpl._lastPromiseId;
                }
                Object.defineProperty(WorkerPromiseImpl.prototype, "resolved", {
                    get: function() {
                        return this._resolved;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(WorkerPromiseImpl.prototype, "result", {
                    get: function() {
                        if (!this._resolved) {
                            throw new Error("Unresolved promise.");
                        }
                        if (this._error !== null) {
                            throw this._error;
                        }
                        return this._result;
                    },
                    enumerable: true,
                    configurable: true
                });
                WorkerPromiseImpl.prototype.then = function(callback) {
                    var _this = this;
                    this._callback = callback;
                    if (this._resolved) {
                        setTimeout(function() {
                            return _this._callback(_this);
                        }, 0);
                    }
                };
                WorkerPromiseImpl.prototype.cancel = function() {
                    if (this._resolved) {
                        return;
                    }
                    this._channel.cancelRequest(this._id);
                };
                Object.defineProperty(WorkerPromiseImpl.prototype, "id", {
                    get: function() {
                        return this._id;
                    },
                    enumerable: true,
                    configurable: true
                });
                WorkerPromiseImpl.prototype.resolve = function(error, result) {
                    this._resolved = true;
                    this._error = error;
                    this._result = result;
                    if (this._callback !== null) {
                        this._callback(this);
                    }
                };
                WorkerPromiseImpl._lastPromiseId = -1;
                return WorkerPromiseImpl;
            }();
        })(libjass.webworker || (libjass.webworker = {}));
    })(libjass || (libjass = {}));
    (function(libjass) {
        (function(parts) {
            /**
             * Represents a CSS color with red, green, blue and alpha components.
             *
             * Instances of this class are immutable.
             *
             * @param {number} red
             * @param {number} green
             * @param {number} blue
             * @param {number=1} alpha
             *
             * @constructor
             * @memberOf libjass.parts
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
                    return "rgba(" + this._red + ", " + this._green + ", " + this._blue + ", " + this._alpha.toFixed(3) + ")";
                };
                return Color;
            }();
            parts.Color = Color;
            /**
             * A comment, i.e., any text enclosed in {} that is not understood as an ASS tag.
             *
             * @param {string} value The text of this comment
             *
             * @constructor
             * @memberOf libjass.parts
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
             * A block of text, i.e., any text not enclosed in {}. Also includes \h.
             *
             * @param {string} value The content of this block of text
             *
             * @constructor
             * @memberOf libjass.parts
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
                    return "Text { value: " + this._value.replace(/\u00A0/g, "\\h") + " }";
                };
                return Text;
            }();
            parts.Text = Text;
            /**
             * A newline character \N.
             *
             * @constructor
             * @memberOf libjass.parts
             */
            var NewLine = function() {
                function NewLine() {}
                return NewLine;
            }();
            parts.NewLine = NewLine;
            /**
             * An italic tag {\i}
             *
             * @param {?boolean} value {\i1} -> true, {\i0} -> false, {\i} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {*} value {\b1} -> true, {\b0} -> false, {\b###} -> weight of the bold (number), {\b} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?boolean} value {\u1} -> true, {\u0} -> false, {\u} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?boolean} value {\s1} -> true, {\s0} -> false, {\s} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?number} value {\bord###} -> width (number), {\bord} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?number} value {\xbord###} -> width (number), {\xbord} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?number} value {\ybord###} -> height (number), {\ybord} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?number} value {\shad###} -> depth (number), {\shad} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?number} value {\xshad###} -> depth (number), {\xshad} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?number} value {\yshad###} -> depth (number), {\yshad} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?number} value {\be###} -> strength (number), {\be} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?number} value {\blur###} -> strength (number), {\blur} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?string} value {\fn###} -> name (string), {\fn} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?number} value {\fs###} -> size (number), {\fs} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?number} value {\fscx###} -> scale (number), {\fscx} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?number} value {\fscy###} -> scale (number), {\fscy} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?number} value {\fsp###} -> spacing (number), {\fsp} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?number} value {\frx###} -> angle (number), {\frx} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?number} value {\fry###} -> angle (number), {\fry} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?number} value {\frz###} -> angle (number), {\frz} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?number} value {\fax###} -> angle (number), {\fax} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?number} value {\fay###} -> angle (number), {\fay} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {libjass.parts.Color} value {\1c###} -> color (Color), {\1c} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {libjass.parts.Color} value {\2c###} -> color (Color), {\2c} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {libjass.parts.Color} value {\3c###} -> color (Color), {\3c} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {libjass.parts.Color} value {\4c###} -> color (Color), {\4c} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?number} value {\alpha###} -> alpha (number), {\alpha} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?number} value {\1a###} -> alpha (number), {\1a} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?number} value {\2a###} -> alpha (number), {\2a} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?number} value {\3a###} -> alpha (number), {\3a} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?number} value {\4a###} -> alpha (number), {\4a} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {number} value {\an###} -> alignment (number)
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {number} duration {\k###} -> duration (number)
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {number} duration {\kf###} -> duration (number)
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {number} duration {\ko###} -> duration (number)
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {number} value {\q###} -> style (number)
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {?string} value {\r###} -> style name (string), {\r} -> null
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {number} x
             * @param {number} y
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {number} x1
             * @param {number} y1
             * @param {number} x2
             * @param {number} y2
             * @param {number} t1
             * @param {number} t2
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {number} x
             * @param {number} y
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {number} start
             * @param {number} end
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {number} a1
             * @param {number} a2
             * @param {number} a3
             * @param {number} t1
             * @param {number} t2
             * @param {number} t3
             * @param {number} t4
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {number} start
             * @param {number} end
             * @param {number} accel
             * @param {!Array.<!libjass.parts.Tag>} tags
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {number} x1
             * @param {number} y1
             * @param {number} x2
             * @param {number} y2
             * @param {boolean} inside
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {number} scale
             * @param {!Array.<!libjass.parts.drawing.Instruction>} instructions
             * @param {boolean} inside
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {number} scale
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {number} value
             *
             * @constructor
             * @memberOf libjass.parts
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
             * @param {!Array.<!libjass.parts.drawing.Instruction>} instructions
             *
             * @constructor
             * @memberOf libjass.parts
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
                 * @param {number} x
                 * @param {number} y
                 *
                 * @constructor
                 * @memberOf libjass.parts.drawing
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
                 * @param {number} x
                 * @param {number} y
                 *
                 * @constructor
                 * @memberOf libjass.parts.drawing
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
                 * @param {number} x1
                 * @param {number} y1
                 * @param {number} x2
                 * @param {number} y2
                 * @param {number} x3
                 * @param {number} y3
                 *
                 * @constructor
                 * @memberOf libjass.parts.drawing
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
                    libjass.webworker._registerClassPrototype(value.prototype);
                }
            });
            Object.keys(libjass.parts.drawing).forEach(function(key) {
                var value = libjass.parts.drawing[key];
                if (value instanceof Function) {
                    addToString(value, "Drawing" + key);
                    libjass.webworker._registerClassPrototype(value.prototype);
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
             */
            function parse(input, rule) {
                var run = new ParserRun(input, rule);
                if (run.result === null || run.result.end !== input.length) {
                    if (libjass.debugMode) {
                        console.error("Parse failed. %s %s %o", rule, input, run.result);
                    }
                    throw new Error("Parse failed.");
                }
                return run.result.value;
            }
            parser.parse = parse;
            /**
             * This class represents a single run of the parser.
             *
             * @param {string} input
             * @param {string} rule
             *
             * @constructor
             * @memberOf libjass.parser
             * @private
             */
            var ParserRun = function() {
                function ParserRun(input, rule) {
                    this._input = input;
                    this._parseTree = new ParseNode(null);
                    this._result = rules.get(rule).call(this, this._parseTree);
                }
                Object.defineProperty(ParserRun.prototype, "result", {
                    /**
                     * @type {ParseNode}
                     */
                    get: function() {
                        return this._result;
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_assScript = function(parent) {
                    var current = new ParseNode(parent);
                    current.value = Object.create(null);
                    while (this._haveMore()) {
                        var scriptSectionNode = this.parse_assScriptSection(current);
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
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_assScriptSection = function(parent) {
                    var current = new ParseNode(parent);
                    current.value = Object.create(null);
                    current.value.contents = null;
                    var sectionHeaderNode = this.parse_assScriptSectionHeader(current);
                    if (sectionHeaderNode === null) {
                        parent.pop();
                        return null;
                    }
                    current.value.name = sectionHeaderNode.value;
                    var formatSpecifier = null;
                    while (this._haveMore() && this._peek() !== "[") {
                        if (this.parse_assScriptComment(current) !== null) {
                            continue;
                        }
                        var propertyNode = this.parse_assScriptProperty(current);
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
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_assScriptSectionHeader = function(parent) {
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
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_assScriptProperty = function(parent) {
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
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_assScriptComment = function(parent) {
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
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_dialogueParts = function(parent) {
                    var current = new ParseNode(parent);
                    current.value = [];
                    while (this._haveMore()) {
                        var enclosedTagsNode = this.parse_enclosedTags(current);
                        if (enclosedTagsNode !== null) {
                            current.value.push.apply(current.value, enclosedTagsNode.value);
                        } else {
                            var newLineNode = this.parse_newline(current);
                            if (newLineNode !== null) {
                                current.value.push(newLineNode.value);
                            } else {
                                var textNode = this.parse_newline(current) || this.parse_hardspace(current) || this.parse_text(current);
                                if (textNode !== null) {
                                    if (current.value[current.value.length - 1] instanceof libjass.parts.Text) {
                                        // Merge consecutive text parts into one part
                                        var previousTextPart = current.value[current.value.length - 1];
                                        current.value[current.value.length - 1] = new libjass.parts.Text(previousTextPart.value + textNode.value.value);
                                    } else {
                                        current.value.push(textNode.value);
                                    }
                                } else {
                                    parent.pop();
                                    return null;
                                }
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
                 * @return {ParseNode}
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
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_newline = function(parent) {
                    var current = new ParseNode(parent);
                    if (this.read(current, "\\N") === null) {
                        parent.pop();
                        return null;
                    }
                    current.value = new libjass.parts.NewLine();
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
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
                 * @return {ParseNode}
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
                 * @return {ParseNode}
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
                 * @return {ParseNode}
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
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_alpha = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
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
                 * @return {ParseNode}
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
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_be = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_blur = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_bord = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_c = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_clip = function(parent) {
                    return this._parse_tag_clip_or_iclip("clip", parent);
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
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
                 * @return {ParseNode}
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
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_fax = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_fay = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
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
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_fr = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_frx = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_fry = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_frz = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_fs = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
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
                 * @return {ParseNode}
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
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_fsp = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_i = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_iclip = function(parent) {
                    return this._parse_tag_clip_or_iclip("iclip", parent);
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_k = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_K = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_kf = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_ko = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
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
                 * @return {ParseNode}
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
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_p = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_pbo = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
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
                 * @return {ParseNode}
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
                 * @return {ParseNode}
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
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_s = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_shad = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
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
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_u = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_xbord = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_xshad = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_ybord = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_yshad = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_1a = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_1c = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_2a = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_2c = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_3a = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_3c = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_4a = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_tag_4c = function() {
                    throw new Error("Method not implemented.");
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_drawingInstructions = function(parent) {
                    var current = new ParseNode(parent);
                    var lastType = null;
                    current.value = [];
                    while (this._haveMore()) {
                        while (this.read(current, " ") !== null) {}
                        if (!this._haveMore()) {
                            break;
                        }
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
                 * @return {ParseNode}
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
                 * @return {ParseNode}
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
                 * @return {ParseNode}
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
                    while (this.read(current, " ") !== null) {}
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
                    while (this.read(current, " ") !== null) {}
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
                 * @return {ParseNode}
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
                 * @return {ParseNode}
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
                 * @return {ParseNode}
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
                 * @return {ParseNode}
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
                 * @return {ParseNode}
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
                 * @return {ParseNode}
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
                 * @return {ParseNode}
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
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_srtScript = function(parent) {
                    var current = new ParseNode(parent);
                    current.value = [];
                    while (this._haveMore()) {
                        var dialogueNode = this.parse_srtDialogue(current);
                        if (dialogueNode === null) {
                            parent.pop();
                            return null;
                        }
                        current.value.push(dialogueNode.value);
                        if (this.read(current, "\n") === null && this._haveMore()) {
                            parent.pop();
                            return null;
                        }
                        while (this.read(current, "\n") !== null) {}
                    }
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_srtDialogue = function(parent) {
                    var current = new ParseNode(parent);
                    current.value = Object.create(null);
                    current.value.bounds = Object.create(null);
                    current.value.bounds.x1 = null;
                    current.value.bounds.y1 = null;
                    current.value.bounds.x2 = null;
                    current.value.bounds.y2 = null;
                    var numberNode = this.parse_unsignedDecimal(current);
                    if (numberNode === null) {
                        parent.pop();
                        return null;
                    }
                    current.value.number = parseInt(numberNode.value);
                    if (this.read(current, "\n") === null) {
                        parent.pop();
                        return null;
                    }
                    var startTimeNode = this.parse_srtTime(current);
                    if (startTimeNode === null) {
                        parent.pop();
                        return null;
                    }
                    current.value.start = startTimeNode.value;
                    if (this.read(current, " --> ") === null) {
                        parent.pop();
                        return null;
                    }
                    var endTimeNode = this.parse_srtTime(current);
                    if (endTimeNode === null) {
                        parent.pop();
                        return null;
                    }
                    current.value.end = endTimeNode.value;
                    if (this.read(current, " ") !== null) {
                        var positionNode = new ParseNode(current, "");
                        for (var next = this._peek(); next !== "\n" && this._haveMore(); next = this._peek()) {
                            positionNode.value += next;
                        }
                        current.value.bounds = positionNode.value;
                    }
                    if (this.read(current, "\n") === null) {
                        parent.pop();
                        return null;
                    }
                    var lineNode = new ParseNode(current, "");
                    while (this._peek() !== "\n" && this._haveMore()) {
                        var currentLine = "";
                        for (var next = this._peek(); currentLine[currentLine.length - 1] !== "\n" && this._haveMore(); next = this._peek()) {
                            currentLine += next;
                            lineNode.value += next;
                        }
                    }
                    current.value.text = lineNode.value;
                    if (current.value.text[current.value.text.length - 1] === "\n") {
                        current.value.text = current.value.text.substr(0, current.value.text.length - 1);
                    }
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 */
                ParserRun.prototype.parse_srtTime = function(parent) {
                    var current = new ParseNode(parent);
                    var hourDigitNodes = new Array(2);
                    for (var i = 0; i < hourDigitNodes.length; i++) {
                        if (!this._haveMore()) {
                            parent.pop();
                            return null;
                        }
                        var next = this._peek();
                        if (next >= "0" && next <= "9") {
                            hourDigitNodes[i] = new ParseNode(current, next);
                        } else {
                            parent.pop();
                            return null;
                        }
                    }
                    if (this.read(current, ":") === null) {
                        parent.pop();
                        return null;
                    }
                    var minuteDigitNodes = new Array(2);
                    for (var i = 0; i < minuteDigitNodes.length; i++) {
                        if (!this._haveMore()) {
                            parent.pop();
                            return null;
                        }
                        var next = this._peek();
                        if (next >= "0" && next <= "9") {
                            minuteDigitNodes[i] = new ParseNode(current, next);
                        } else {
                            parent.pop();
                            return null;
                        }
                    }
                    if (this.read(current, ":") === null) {
                        parent.pop();
                        return null;
                    }
                    var secondDigitNodes = new Array(2);
                    for (var i = 0; i < secondDigitNodes.length; i++) {
                        if (!this._haveMore()) {
                            parent.pop();
                            return null;
                        }
                        var next = this._peek();
                        if (next >= "0" && next <= "9") {
                            secondDigitNodes[i] = new ParseNode(current, next);
                        } else {
                            parent.pop();
                            return null;
                        }
                    }
                    if (this.read(current, ",") === null) {
                        parent.pop();
                        return null;
                    }
                    var millisecondDigitNodes = new Array(3);
                    for (var i = 0; i < millisecondDigitNodes.length; i++) {
                        if (!this._haveMore()) {
                            parent.pop();
                            return null;
                        }
                        var next = this._peek();
                        if (next >= "0" && next <= "9") {
                            millisecondDigitNodes[i] = new ParseNode(current, next);
                        } else {
                            parent.pop();
                            return null;
                        }
                    }
                    current.value = hourDigitNodes[0].value + hourDigitNodes[1].value + ":" + minuteDigitNodes[0].value + minuteDigitNodes[1].value + ":" + secondDigitNodes[0].value + secondDigitNodes[1].value + "." + millisecondDigitNodes[0].value + millisecondDigitNodes[1].value + millisecondDigitNodes[2].value;
                    return current;
                };
                /**
                 * @param {!ParseNode} parent
                 * @param {string} next
                 * @return {ParseNode}
                 */
                ParserRun.prototype.read = function(parent, next) {
                    if (this._peek(next.length) !== next) {
                        return null;
                    }
                    return new ParseNode(parent, next);
                };
                /**
                 * @param {number=1} count
                 *
                 * @private
                 */
                ParserRun.prototype._peek = function(count) {
                    if (typeof count === "undefined") {
                        count = 1;
                    }
                    return this._input.substr(this._parseTree.end, count);
                };
                /**
                 * @return {boolean}
                 *
                 * @private
                 */
                ParserRun.prototype._haveMore = function() {
                    return this._parseTree.end < this._input.length;
                };
                /**
                 * @param {string} tagName One of "clip" and "iclip"
                 * @param {!ParseNode} parent
                 * @return {ParseNode}
                 *
                 * @private
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
                    } else if (!required) {
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
             * @param {ParseNode} parent The parent of this parse node. The parent's end position will be updated to the end position of this node whenever the latter changes.
             * @param {?string=null} value A shortcut to assign a string to the value property.
             *
             * @constructor
             * @memberOf libjass.parser
             * @private
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
                     * @type {ParseNode}
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
                 *
                 * @private
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
    (function(libjass) {
        (function(webworker) {
            (function(WorkerCommands) {
                WorkerCommands[WorkerCommands["Parse"] = 1] = "Parse";
            })(webworker.WorkerCommands || (webworker.WorkerCommands = {}));
            libjass.webworker._registerWorkerCommand(1, function(parameters, response) {
                try {
                    response(null, libjass.parser.parse(parameters.input, parameters.rule));
                } catch (ex) {
                    response(ex, null);
                }
            });
        })(libjass.webworker || (libjass.webworker = {}));
    })(libjass || (libjass = {}));
    (function(libjass) {
        (function(renderers) {
            /**
             * A mixin class that represents an event source.
             *
             * @template T
             *
             * @constructor
             * @memberOf libjass.renderers
             */
            var EventSource = function() {
                function EventSource() {}
                /**
                 * Add a listener for the given event.
                 *
                 * @param {!T} type The type of event to attach the listener for
                 * @param {!Function} listener The listener
                 */
                EventSource.prototype.addEventListener = function(type, listener) {
                    var listeners = this._eventListeners.get(type);
                    if (listeners === undefined) {
                        this._eventListeners.set(type, listeners = []);
                    }
                    listeners.push(listener);
                };
                /**
                 * @param {!T} type The type of event to dispatch
                 * @param {!Array.<*>} args Arguments for the listeners of the event
                 */
                EventSource.prototype._dispatchEvent = function(type, args) {
                    var _this = this;
                    var listeners = this._eventListeners.get(type);
                    if (listeners !== undefined) {
                        listeners.forEach(function(listener) {
                            listener.apply(_this, args);
                        });
                    }
                };
                return EventSource;
            }();
            renderers.EventSource = EventSource;
            (function(ClockEvent) {
                ClockEvent[ClockEvent["Play"] = 0] = "Play";
                ClockEvent[ClockEvent["Pause"] = 1] = "Pause";
                ClockEvent[ClockEvent["TimeUpdate"] = 2] = "TimeUpdate";
            })(renderers.ClockEvent || (renderers.ClockEvent = {}));
            /**
             * An implementation of libjass.renderers.Clock that allows user script to manually trigger play, pause and timeUpdate events.
             *
             * @constructor
             * @memberOf libjass.renderers
             */
            var ManualClock = function() {
                function ManualClock() {
                    this._currentTime = -1;
                    // EventSource members
                    this._eventListeners = new libjass.Map();
                }
                /**
                 * Trigger a play event.
                 */
                ManualClock.prototype.play = function() {
                    this._dispatchEvent(0, []);
                };
                /**
                 * Trigger a pause event.
                 */
                ManualClock.prototype.pause = function() {
                    this._dispatchEvent(1, []);
                };
                /**
                 * Trigger a timeUpdate event with the given current time.
                 *
                 * @param {number} currentTime
                 */
                ManualClock.prototype.timeUpdate = function(currentTime) {
                    this._currentTime = currentTime;
                    this._dispatchEvent(2, []);
                };
                Object.defineProperty(ManualClock.prototype, "currentTime", {
                    /**
                     * @type {number}
                     */
                    get: function() {
                        return this._currentTime;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ManualClock.prototype, "enabled", {
                    /**
                     * @type {boolean}
                     */
                    get: function() {
                        return true;
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * Enable the clock. This is a no-op for this type.
                 */
                ManualClock.prototype.enable = function() {};
                /**
                 * Disable the clock. This is a no-op for this type.
                 */
                ManualClock.prototype.disable = function() {};
                /**
                 * Toggle the clock. This is a no-op for this type.
                 */
                ManualClock.prototype.toggle = function() {};
                return ManualClock;
            }();
            renderers.ManualClock = ManualClock;
            libjass.mixin(ManualClock, [ EventSource ]);
            var VideoClockState;
            (function(VideoClockState) {
                VideoClockState[VideoClockState["Playing"] = 0] = "Playing";
                VideoClockState[VideoClockState["Paused"] = 1] = "Paused";
            })(VideoClockState || (VideoClockState = {}));
            /**
             * An implementation of libjass.renderers.Clock that generates play, pause and timeUpdate events according to the state of a <video> element.
             *
             * @param {!HTMLVideoElement} video
             *
             * @constructor
             * @memberOf libjass.renderers
             */
            var VideoClock = function() {
                function VideoClock(video) {
                    var _this = this;
                    this._video = video;
                    this._enabled = true;
                    this._nextAnimationFrameRequestId = null;
                    // EventSource members
                    this._eventListeners = new libjass.Map();
                    this._video.addEventListener("playing", function() {
                        return _this._onVideoPlaying();
                    }, false);
                    this._video.addEventListener("pause", function() {
                        return _this._onVideoPause();
                    }, false);
                    this._video.addEventListener("seeking", function() {
                        return _this._onVideoSeeking();
                    }, false);
                }
                Object.defineProperty(VideoClock.prototype, "currentTime", {
                    /**
                     * @type {number}
                     */
                    get: function() {
                        return this._currentTime;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(VideoClock.prototype, "enabled", {
                    /**
                     * @type {boolean}
                     */
                    get: function() {
                        return this._enabled;
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * Enable the clock.
                 */
                VideoClock.prototype.enable = function() {
                    if (this._enabled) {
                        return;
                    }
                    this._enabled = true;
                    this._onVideoPlaying();
                };
                /**
                 * Disable the clock.
                 */
                VideoClock.prototype.disable = function() {
                    if (!this._enabled) {
                        return;
                    }
                    this._onVideoPause();
                    this._enabled = false;
                };
                /**
                 * Toggle the clock.
                 */
                VideoClock.prototype.toggle = function() {
                    if (this._enabled) {
                        this.disable();
                    } else {
                        this.enable();
                    }
                };
                VideoClock.prototype._onVideoPlaying = function() {
                    if (!this._enabled) {
                        return;
                    }
                    if (this._state === 0) {
                        return;
                    }
                    this._state = 0;
                    this._dispatchEvent(0, []);
                    if (this._nextAnimationFrameRequestId === null) {
                        this._timerTick();
                    }
                };
                VideoClock.prototype._onVideoPause = function() {
                    if (!this._enabled) {
                        return;
                    }
                    this._state = 1;
                    this._dispatchEvent(1, []);
                    if (this._nextAnimationFrameRequestId === null) {
                        if (libjass.debugMode) {
                            console.warn("VideoClock._onVideoPause: Abnormal state detected. VideoClock._nextAnimationFrameRequestId should not have been null");
                        }
                    }
                    cancelAnimationFrame(this._nextAnimationFrameRequestId);
                    this._nextAnimationFrameRequestId = null;
                    if (libjass.verboseMode) {
                        console.log("VideoClock._onVideoPause: Cancelled VideoClock._nextAnimationFrameRequestId");
                    }
                };
                VideoClock.prototype._onVideoSeeking = function() {
                    if (!this._enabled) {
                        return;
                    }
                    if (this._currentTime === this._video.currentTime) {
                        return;
                    }
                    if (this._state !== 1) {
                        return;
                    }
                    this._currentTime = this._video.currentTime;
                    this._dispatchEvent(0, []);
                    this._dispatchEvent(2, []);
                    this._dispatchEvent(1, []);
                };
                VideoClock.prototype._timerTick = function() {
                    var _this = this;
                    if (this._currentTime !== this._video.currentTime) {
                        this._currentTime = this._video.currentTime;
                        if (this._state !== 0) {
                            this._state = 0;
                            this._dispatchEvent(0, []);
                        }
                        this._dispatchEvent(2, []);
                    } else {
                        if (this._state !== 1) {
                            this._state = 1;
                            this._dispatchEvent(1, []);
                        }
                    }
                    this._nextAnimationFrameRequestId = requestAnimationFrame(function() {
                        return _this._timerTick();
                    });
                };
                return VideoClock;
            }();
            renderers.VideoClock = VideoClock;
            libjass.mixin(VideoClock, [ EventSource ]);
        })(libjass.renderers || (libjass.renderers = {}));
    })(libjass || (libjass = {}));
    (function(libjass) {
        (function(renderers) {
            /**
             * A renderer implementation that doesn't output anything.
             *
             * @param {!libjass.ASS} ass
             * @param {!libjass.renderers.Clock} clock
             * @param {!libjass.renderers.RendererSettings} settings
             *
             * @constructor
             * @memberOf libjass.renderers
             */
            var NullRenderer = function() {
                function NullRenderer(ass, clock, settings) {
                    var _this = this;
                    this._ass = ass;
                    this._clock = clock;
                    this._id = ++NullRenderer._lastRendererId;
                    this._settings = RendererSettings.from(settings);
                    this._clock.addEventListener(0, function() {
                        return _this._onClockPlay();
                    });
                    this._clock.addEventListener(1, function() {
                        return _this._onClockPause();
                    });
                    this._clock.addEventListener(2, function() {
                        return _this._onClockTimeUpdate();
                    });
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
                Object.defineProperty(NullRenderer.prototype, "clock", {
                    /**
                     * @type {!libjass.renderers.Clock}
                     */
                    get: function() {
                        return this._clock;
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
                /**
                 * Pre-render a dialogue. This is a no-op for this type.
                 *
                 * @param {!libjass.Dialogue} dialogue
                 */
                NullRenderer.prototype.preRender = function() {};
                /**
                 * Draw a dialogue. This is a no-op for this type.
                 *
                 * @param {!libjass.Dialogue} dialogue
                 */
                NullRenderer.prototype.draw = function() {};
                /**
                 * Runs when the clock starts playing, or is resumed from pause.
                 */
                NullRenderer.prototype._onClockPlay = function() {
                    if (libjass.verboseMode) {
                        console.log("NullRenderer._onClockPlay");
                    }
                };
                /**
                 * Runs when the clock is paused.
                 */
                NullRenderer.prototype._onClockPause = function() {
                    if (libjass.verboseMode) {
                        console.log("NullRenderer._onClockPause");
                    }
                };
                /**
                 * Runs when the clock's current time changed. This might be a result of either regular playback or seeking.
                 */
                NullRenderer.prototype._onClockTimeUpdate = function() {
                    var currentTime = this.clock.currentTime;
                    if (libjass.verboseMode) {
                        console.log("NullRenderer._onClockTimeUpdate: currentTime = " + currentTime);
                    }
                    for (var i = 0; i < this._ass.dialogues.length; i++) {
                        var dialogue = this._ass.dialogues[i];
                        if (dialogue.end > currentTime) {
                            if (dialogue.start <= currentTime) {
                                // This dialogue is visible right now. Draw it.
                                this.draw(dialogue);
                            } else if (dialogue.start <= currentTime + this._settings.preRenderTime) {
                                // This dialogue will be visible soon. Pre-render it.
                                this.preRender(dialogue);
                            }
                        }
                    }
                };
                NullRenderer._lastRendererId = -1;
                return NullRenderer;
            }();
            renderers.NullRenderer = NullRenderer;
            /**
             * Settings for the renderer.
             *
             * @constructor
             * @memberOf libjass.renderers
             */
            var RendererSettings = function() {
                function RendererSettings() {}
                /**
                 * A convenience method to create a font map from a <style> or <link> element that contains @font-face rules.
                 *
                 * @param {!LinkStyle} linkStyle
                 * @return {!Map.<string, !Array.<string>>}
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
        })(libjass.renderers || (libjass.renderers = {}));
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
             * A renderer implementation that draws subtitles to the given <div>
             *
             * @param {!libjass.ASS} ass
             * @param {!libjass.renderers.Clock} clock
             * @param {!libjass.renderers.RendererSettings} settings
             * @param {!HTMLDivElement} libjassSubsWrapper Subtitles will be rendered to this <div>
             *
             * @constructor
             * @extends {libjass.renderers.NullRenderer}
             * @memberOf libjass.renderers
             */
            var WebRenderer = function(_super) {
                __extends(WebRenderer, _super);
                function WebRenderer(ass, clock, settings, libjassSubsWrapper) {
                    var _this = this;
                    _super.call(this, ass, clock, settings);
                    this._libjassSubsWrapper = libjassSubsWrapper;
                    this._layerWrappers = [];
                    this._layerAlignmentWrappers = [];
                    this._fontSizeElement = null;
                    this._animationStyleElement = null;
                    this._svgDefsElement = null;
                    this._currentSubs = new libjass.Map();
                    this._preRenderedSubs = new libjass.Map();
                    this._enabled = true;
                    // EventSource members
                    this._eventListeners = new libjass.Map();
                    this._libjassSubsWrapper.classList.add("libjass-wrapper");
                    this._subsWrapper = document.createElement("div");
                    this._libjassSubsWrapper.appendChild(this._subsWrapper);
                    this._subsWrapper.className = "libjass-subs";
                    this._fontSizeElement = document.createElement("div");
                    this._libjassSubsWrapper.appendChild(this._fontSizeElement);
                    this._fontSizeElement.className = "libjass-font-measure";
                    this._fontSizeElement.appendChild(document.createTextNode("M"));
                    var svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    this._libjassSubsWrapper.appendChild(svgElement);
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
                        // Preload fonts
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
                }
                Object.defineProperty(WebRenderer.prototype, "libjassSubsWrapper", {
                    get: function() {
                        return this._libjassSubsWrapper;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(WebRenderer.prototype, "enabled", {
                    /**
                     * @type {boolean}
                     */
                    get: function() {
                        return this._enabled;
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * Resize the subtitles to the given new dimensions.
                 *
                 * @param {number} width
                 * @param {number} height
                 */
                WebRenderer.prototype.resize = function(width, height) {
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
                    // this.currentTime will be -1 if resize() is called before the clock begins playing for the first time. In this situation, there is no need to force a redraw.
                    if (this.clock.currentTime !== -1) {
                        this._onClockTimeUpdate();
                    }
                };
                WebRenderer.prototype.enable = function() {
                    this.clock.enable();
                    this._subsWrapper.style.display = "";
                    this._enabled = true;
                };
                WebRenderer.prototype.disable = function() {
                    this.clock.disable();
                    this._subsWrapper.style.display = "none";
                    this._enabled = false;
                };
                WebRenderer.prototype.toggle = function() {
                    if (this._enabled) {
                        this.disable();
                    } else {
                        this.enable();
                    }
                };
                /**
                 * The magic happens here. The subtitle div is rendered and stored. Call draw() to get a clone of the div to display.
                 *
                 * @param {!libjass.Dialogue} dialogue
                 */
                WebRenderer.prototype.preRender = function(dialogue) {
                    var _this = this;
                    if (this._preRenderedSubs.has(dialogue.id)) {
                        return;
                    }
                    var sub = document.createElement("div");
                    sub.style.marginLeft = (this._scaleX * dialogue.style.marginLeft).toFixed(3) + "px";
                    sub.style.marginRight = (this._scaleX * dialogue.style.marginRight).toFixed(3) + "px";
                    sub.style.marginTop = sub.style.marginBottom = (this._scaleY * dialogue.style.marginVertical).toFixed(3) + "px";
                    sub.style.minWidth = (this._subsWrapper.offsetWidth - this._scaleX * (dialogue.style.marginLeft + dialogue.style.marginRight)).toFixed(3) + "px";
                    var animationCollection = new AnimationCollection(this, dialogue);
                    var currentSpan = null;
                    var currentSpanStyles = new SpanStyles(this, dialogue, this._scaleX, this._scaleY, this._fontSizeElement, this._svgDefsElement);
                    var startNewSpan = function(addNewLine) {
                        if (currentSpan !== null && currentSpan.textContent !== "") {
                            sub.appendChild(currentSpanStyles.setStylesOnSpan(currentSpan));
                        }
                        if (addNewLine) {
                            sub.appendChild(document.createElement("br"));
                        }
                        currentSpan = document.createElement("span");
                    };
                    startNewSpan(false);
                    var currentDrawingStyles = new DrawingStyles(this._scaleX, this._scaleY);
                    var wrappingStyle = this.ass.properties.wrappingStyle;
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
                        } else if (part instanceof libjass.parts.Blur) {
                            currentSpanStyles.blur = part.value;
                        } else if (part instanceof libjass.parts.GaussianBlur) {
                            currentSpanStyles.gaussianBlur = part.value;
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
                            currentSpanStyles.rotationX = part.value;
                        } else if (part instanceof libjass.parts.RotateY) {
                            currentSpanStyles.rotationY = part.value;
                        } else if (part instanceof libjass.parts.RotateZ) {
                            currentSpanStyles.rotationZ = part.value;
                        } else if (part instanceof libjass.parts.SkewX) {
                            currentSpanStyles.skewX = part.value;
                        } else if (part instanceof libjass.parts.SkewY) {
                            currentSpanStyles.skewY = part.value;
                        } else if (part instanceof libjass.parts.PrimaryColor) {
                            currentSpanStyles.primaryColor = part.value;
                        } else if (part instanceof libjass.parts.SecondaryColor) {
                            currentSpanStyles.secondaryColor = part.value;
                        } else if (part instanceof libjass.parts.OutlineColor) {
                            currentSpanStyles.outlineColor = part.value;
                        } else if (part instanceof libjass.parts.ShadowColor) {
                            currentSpanStyles.shadowColor = part.value;
                        } else if (part instanceof libjass.parts.Alpha) {
                            currentSpanStyles.primaryAlpha = part.value;
                            currentSpanStyles.secondaryAlpha = part.value;
                            currentSpanStyles.outlineAlpha = part.value;
                            currentSpanStyles.shadowAlpha = part.value;
                        } else if (part instanceof libjass.parts.PrimaryAlpha) {
                            currentSpanStyles.primaryAlpha = part.value;
                        } else if (part instanceof libjass.parts.SecondaryAlpha) {
                            currentSpanStyles.secondaryAlpha = part.value;
                        } else if (part instanceof libjass.parts.OutlineAlpha) {
                            currentSpanStyles.outlineAlpha = part.value;
                        } else if (part instanceof libjass.parts.ShadowAlpha) {
                            currentSpanStyles.shadowAlpha = part.value;
                        } else if (part instanceof libjass.parts.Alignment) {} else if (part instanceof libjass.parts.WrappingStyle) {
                            wrappingStyle = part.value;
                        } else if (part instanceof libjass.parts.Reset) {
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
                            animationCollection.add("linear", [ new Keyframe(0, {
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
                            }) ]);
                        } else if (part instanceof libjass.parts.Fade) {
                            var fadePart = part;
                            animationCollection.add("linear", [ new Keyframe(0, {
                                opacity: "0"
                            }), new Keyframe(fadePart.start, {
                                opacity: "1"
                            }), new Keyframe(dialogue.end - dialogue.start - fadePart.end, {
                                opacity: String("1")
                            }), new Keyframe(dialogue.end - dialogue.start, {
                                opacity: "0"
                            }) ]);
                        } else if (part instanceof libjass.parts.ComplexFade) {
                            var complexFadePart = part;
                            animationCollection.add("linear", [ new Keyframe(0, {
                                opacity: String(complexFadePart.a1)
                            }), new Keyframe(complexFadePart.t1, {
                                opacity: String(complexFadePart.a1)
                            }), new Keyframe(complexFadePart.t2, {
                                opacity: String(complexFadePart.a2)
                            }), new Keyframe(complexFadePart.t3, {
                                opacity: String(complexFadePart.a2)
                            }), new Keyframe(complexFadePart.t4, {
                                opacity: String(complexFadePart.a3)
                            }), new Keyframe(dialogue.end - dialogue.start, {
                                opacity: String(complexFadePart.a3)
                            }) ]);
                        } else if (part instanceof libjass.parts.DrawingMode) {
                            var drawingModePart = part;
                            if (drawingModePart.scale !== 0) {
                                currentDrawingStyles.scale = drawingModePart.scale;
                            }
                        } else if (part instanceof libjass.parts.DrawingBaselineOffset) {
                            currentDrawingStyles.baselineOffset = part.value;
                        } else if (part instanceof libjass.parts.DrawingInstructions) {
                            currentSpan.appendChild(currentDrawingStyles.toSVG(part, currentSpanStyles.primaryColor.withAlpha(currentSpanStyles.primaryAlpha)));
                            startNewSpan(false);
                        } else if (part instanceof libjass.parts.Text) {
                            currentSpan.appendChild(document.createTextNode(part.value));
                            startNewSpan(false);
                        } else if (libjass.debugMode && part instanceof libjass.parts.Comment) {
                            currentSpan.appendChild(document.createTextNode(part.value));
                            startNewSpan(false);
                        } else if (part instanceof libjass.parts.NewLine) {
                            startNewSpan(true);
                        }
                    });
                    dialogue.parts.some(function(part) {
                        if (part instanceof libjass.parts.Position || part instanceof libjass.parts.Move) {
                            var transformOrigin = WebRenderer._transformOrigins[dialogue.alignment];
                            var divTransformStyle = "translate(" + -transformOrigin[0] + "%, " + -transformOrigin[1] + "%) translate(-" + sub.style.marginLeft + ", -" + sub.style.marginTop + ")";
                            var transformOriginString = transformOrigin[0] + "% " + transformOrigin[1] + "%";
                            sub.style.webkitTransform = divTransformStyle;
                            sub.style.webkitTransformOrigin = transformOriginString;
                            sub.style.transform = divTransformStyle;
                            sub.style.transformOrigin = transformOriginString;
                            return true;
                        }
                        return false;
                    });
                    switch (wrappingStyle) {
                      case 0:
                      case 3:
                        sub.style.whiteSpace = "pre-wrap";
                        break;

                      case 1:
                      case 2:
                        sub.style.whiteSpace = "pre";
                        break;
                    }
                    if (sub.style.position !== "") {
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
                 * div is inserted into the DOM and the animations begin, they are in sync with the clock time.
                 *
                 * @param {!libjass.Dialogue} dialogue
                 */
                WebRenderer.prototype.draw = function(dialogue) {
                    var _this = this;
                    if (this._currentSubs.has(dialogue)) {
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
                            return (parseFloat(delay) + dialogue.start - _this.clock.currentTime).toFixed(3) + "s";
                        }).join(",");
                        result.style.webkitAnimationDelay = animationDelay;
                        result.style.animationDelay = animationDelay;
                    }
                    var layer = dialogue.layer;
                    var alignment = result.style.position === "absolute" ? 0 : dialogue.alignment;
                    // Create the layer wrapper div and the alignment div inside it if not already created
                    if (this._layerWrappers[layer] === undefined) {
                        var layerWrapper = document.createElement("div");
                        layerWrapper.className = "layer layer" + layer;
                        // Find the next greater layer div and insert this div before that one
                        var insertBeforeElement = null;
                        for (var insertBeforeLayer = layer + 1; insertBeforeLayer < this._layerWrappers.length && insertBeforeElement === null; insertBeforeLayer++) {
                            if (this._layerWrappers[insertBeforeLayer] !== undefined) {
                                insertBeforeElement = this._layerWrappers[insertBeforeLayer];
                            }
                        }
                        this._subsWrapper.insertBefore(layerWrapper, insertBeforeElement);
                        this._layerWrappers[layer] = layerWrapper;
                        this._layerAlignmentWrappers[layer] = [];
                    }
                    if (this._layerAlignmentWrappers[layer][alignment] === undefined) {
                        var layerAlignmentWrapper = document.createElement("div");
                        layerAlignmentWrapper.className = "an an" + alignment;
                        // Find the next greater layer,alignment div and insert this div before that one
                        var layerWrapper = this._layerWrappers[layer];
                        var insertBeforeElement = null;
                        for (var insertBeforeAlignment = alignment + 1; insertBeforeAlignment < this._layerAlignmentWrappers[layer].length && insertBeforeElement === null; insertBeforeAlignment++) {
                            if (this._layerAlignmentWrappers[layer][insertBeforeAlignment] !== undefined) {
                                insertBeforeElement = this._layerAlignmentWrappers[layer][insertBeforeAlignment];
                            }
                        }
                        layerWrapper.insertBefore(layerAlignmentWrapper, insertBeforeElement);
                        this._layerAlignmentWrappers[layer][alignment] = layerAlignmentWrapper;
                    }
                    this._layerAlignmentWrappers[layer][alignment].appendChild(result);
                    this._currentSubs.set(dialogue, result);
                };
                WebRenderer.prototype._onClockPlay = function() {
                    _super.prototype._onClockPlay.call(this);
                    this._removeAllSubs();
                    this._subsWrapper.classList.remove("paused");
                };
                WebRenderer.prototype._onClockPause = function() {
                    _super.prototype._onClockPause.call(this);
                    this._subsWrapper.classList.add("paused");
                };
                WebRenderer.prototype._onClockTimeUpdate = function() {
                    var _this = this;
                    var currentTime = this.clock.currentTime;
                    _super.prototype._onClockTimeUpdate.call(this);
                    this._currentSubs.forEach(function(sub, dialogue) {
                        if (dialogue.start > currentTime || dialogue.end < currentTime) {
                            _this._currentSubs.delete(dialogue);
                            _this._removeSub(sub);
                        }
                    });
                };
                WebRenderer.prototype._ready = function() {
                    this._dispatchEvent("ready", []);
                };
                WebRenderer.prototype._removeSub = function(sub) {
                    sub.parentNode.removeChild(sub);
                };
                WebRenderer.prototype._removeAllSubs = function() {
                    var _this = this;
                    this._currentSubs.forEach(function(sub) {
                        return _this._removeSub(sub);
                    });
                    this._currentSubs.clear();
                };
                WebRenderer._transformOrigins = [ null, [ 0, 100 ], [ 50, 100 ], [ 100, 100 ], [ 0, 50 ], [ 50, 50 ], [ 100, 50 ], [ 0, 0 ], [ 50, 0 ], [ 100, 0 ] ];
                return WebRenderer;
            }(renderers.NullRenderer);
            renderers.WebRenderer = WebRenderer;
            libjass.mixin(WebRenderer, [ renderers.EventSource ]);
            /**
             * This class represents a single keyframe. It has a list of CSS properties (names and values) associated with a point in time. Multiple keyframes make up an animation.
             *
             * @param {number} time
             * @param {!Object.<string, string>} properties
             *
             * @constructor
             * @memberOf libjass.renderers
             * @private
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
             * @param {!libjass.renderers.NullRenderer} renderer The renderer that this collection is associated with
             * @param {!libjass.Dialogue} dialogue The Dialogue that this collection is associated with
             *
             * @constructor
             * @memberOf libjass.renderers
             * @private
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
                 * Add an animation to this collection. The given keyframes together make one animation.
                 *
                 * @param {string} timingFunction One of the acceptable values for the "animation-timing-function" CSS property
                 * @param {Array.<!{time: number, properties: !Object.<string, string>}>} keyframes
                 */
                AnimationCollection.prototype.add = function(timingFunction, keyframes) {
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
             * @param {!libjass.renderers.NullRenderer} renderer The renderer that this set of styles is associated with
             * @param {!libjass.Dialogue} dialogue The Dialogue that this set of styles is associated with
             * @param {number} scaleX The horizontal scaling of the subtitles
             * @param {number} scaleY The vertical scaling of the subtitles
             * @param {!HTMLDivElement} fontSizeElement A <div> element to measure font sizes with
             * @param {!SVGDefsElement} svgDefsElement An SVG <defs> element to append filter definitions to
             *
             * @constructor
             * @memberOf libjass.renderers
             * @private
             */
            var SpanStyles = function() {
                function SpanStyles(renderer, dialogue, scaleX, scaleY, fontSizeElement, svgDefsElement) {
                    this._scaleX = scaleX;
                    this._scaleY = scaleY;
                    this._fontSizeElement = fontSizeElement;
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
                    this._rotationX = null;
                    this._rotationY = null;
                    this._rotationZ = newStyle.rotationZ;
                    this._skewX = null;
                    this._skewY = null;
                    this.primaryColor = newStyle.primaryColor;
                    this.secondaryColor = newStyle.secondaryColor;
                    this.outlineColor = newStyle.outlineColor;
                    this.shadowColor = newStyle.shadowColor;
                    this.primaryAlpha = null;
                    this.secondaryAlpha = null;
                    this.outlineAlpha = null;
                    this.shadowAlpha = null;
                    this.blur = null;
                    this.gaussianBlur = null;
                };
                /**
                 * Sets the style attribute on the given span element.
                 *
                 * @param {!HTMLSpanElement} span
                 * @return {!HTMLSpanElement} The resulting <span> with the CSS styles applied. This may be a wrapper around the input <span> if the styles were applied using SVG filters.
                 */
                SpanStyles.prototype.setStylesOnSpan = function(span) {
                    var isTextOnlySpan = span.childNodes[0] instanceof Text;
                    var fontStyleOrWeight = "";
                    if (this._italic) {
                        fontStyleOrWeight += "italic ";
                    }
                    if (this._bold === true) {
                        fontStyleOrWeight += "bold ";
                    } else if (this._bold !== false) {
                        fontStyleOrWeight += this._bold + " ";
                    }
                    var fontSize;
                    if (isTextOnlySpan) {
                        fontSize = (this._scaleY * SpanStyles._getFontSize(this._fontName, this._fontSize * this._fontScaleX, this._fontSizeElement)).toFixed(3);
                    } else {
                        fontSize = (this._scaleY * SpanStyles._getFontSize(this._fontName, this._fontSize, this._fontSizeElement)).toFixed(3);
                    }
                    var lineHeight = (this._scaleY * this._fontSize).toFixed(3);
                    span.style.font = fontStyleOrWeight + fontSize + "px/" + lineHeight + 'px "' + this._fontName + '"';
                    var textDecoration = "";
                    if (this._underline) {
                        textDecoration = "underline";
                    }
                    if (this._strikeThrough) {
                        textDecoration += " line-through";
                    }
                    span.style.textDecoration = textDecoration.trim();
                    var transform = "";
                    if (isTextOnlySpan) {
                        if (this._fontScaleY !== this._fontScaleX) {
                            transform += "scaleY(" + (this._fontScaleY / this._fontScaleX).toFixed(3) + ") ";
                        }
                    } else {
                        if (this._fontScaleX !== 1) {
                            transform += "scaleX(" + this._fontScaleX + ") ";
                        }
                        if (this._fontScaleY !== 1) {
                            transform += "scaleY(" + this._fontScaleY + ") ";
                        }
                    }
                    if (this._rotationY !== null) {
                        transform += "rotateY(" + this._rotationY + "deg) ";
                    }
                    if (this._rotationX !== null) {
                        transform += "rotateX(" + this._rotationX + "deg) ";
                    }
                    if (this._rotationZ !== 0) {
                        transform += "rotateZ(" + -1 * this._rotationZ + "deg) ";
                    }
                    if (this._skewX !== null || this._skewY !== null) {
                        var skewX = SpanStyles._valueOrDefault(this._skewX, 0);
                        var skewY = SpanStyles._valueOrDefault(this._skewY, 0);
                        transform += "matrix(1, " + skewY + ", " + skewX + ", 1, 0, 0) ";
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
                    var outlineFilter = "";
                    if (outlineWidth > 0 || outlineHeight > 0) {
                        var mergeOutlinesFilter = "";
                        var radiiPairs = [];
                        if (outlineWidth >= outlineHeight) {
                            if (outlineHeight > 0) {
                                for (var y = 0; y <= outlineHeight; y++) {
                                    radiiPairs.push([ outlineWidth / outlineHeight * Math.sqrt(outlineHeight * outlineHeight - y * y), y ]);
                                }
                            } else {
                                radiiPairs.push([ outlineWidth, 0 ]);
                            }
                        } else {
                            if (outlineWidth > 0) {
                                for (var x = 0; x <= outlineWidth; x++) {
                                    radiiPairs.push([ x, outlineHeight / outlineWidth * Math.sqrt(outlineWidth * outlineWidth - x * x) ]);
                                }
                            } else {
                                radiiPairs.push([ 0, outlineHeight ]);
                            }
                        }
                        radiiPairs.forEach(function(radii, index) {
                            outlineFilter += '	<feMorphology in="SourceAlpha" operator="dilate" radius="' + radii[0].toFixed(3) + " " + radii[1].toFixed(3) + '" result="outline' + index + '" />\n';
                            mergeOutlinesFilter += '		<feMergeNode in="outline' + index + '" />\n';
                        });
                        outlineFilter = '	<feFlood flood-color="' + outlineColor.toString() + '" result="outlineColor" />' + outlineFilter + "	<feMerge>\n" + mergeOutlinesFilter + "	</feMerge>\n" + '	<feComposite operator="in" in="outlineColor" />';
                    }
                    var blurFilter = "";
                    if (this._gaussianBlur > 0) {
                        blurFilter += '	<feGaussianBlur stdDeviation="' + this._gaussianBlur + '" />\n';
                    }
                    for (var i = 0; i < this._blur; i++) {
                        blurFilter += '	<feConvolveMatrix kernelMatrix="1 2 1 2 4 2 1 2 1" edgeMode="none" />\n';
                    }
                    var filterWrapperSpan = document.createElement("span");
                    filterWrapperSpan.appendChild(span);
                    if (outlineFilter !== "" || blurFilter !== "") {
                        var filterString = '<filter xmlns="http://www.w3.org/2000/svg" id="' + filterId + '">\n' + outlineFilter + blurFilter + "	<feMerge>\n" + "		<feMergeNode />\n" + '		<feMergeNode in="SourceGraphic" />\n' + "	</feMerge>\n" + "</filter>\n";
                        var filterElement = domParser.parseFromString(filterString, "image/svg+xml").childNodes[0];
                        this._svgDefsElement.appendChild(filterElement);
                        filterWrapperSpan.style.webkitFilter = 'url("#' + filterId + '")';
                        filterWrapperSpan.style.filter = 'url("#' + filterId + '")';
                    }
                    if (this._shadowDepthX !== 0 || this._shadowDepthY !== 0) {
                        var shadowColor = this._shadowColor.withAlpha(this._shadowAlpha);
                        span.style.textShadow = shadowColor.toString() + " " + (this._shadowDepthX * this._scaleX / this._fontScaleX).toFixed(3) + "px " + (this._shadowDepthY * this._scaleY / this._fontScaleY).toFixed(3) + "px 0px";
                    }
                    if (this._rotationZ !== 0) {
                        // Perspective needs to be set on a "transformable element"
                        filterWrapperSpan.style.display = "inline-block";
                    }
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
                Object.defineProperty(SpanStyles.prototype, "gaussianBlur", {
                    /**
                     * Sets the Gaussian blur property. null defaults it to 0.
                     *
                     * @type {?number}
                     */
                    set: function(value) {
                        this._gaussianBlur = SpanStyles._valueOrDefault(value, 0);
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
                Object.defineProperty(SpanStyles.prototype, "rotationX", {
                    /**
                     * Sets the X-axis rotation property.
                     *
                     * @type {?number}
                     */
                    set: function(value) {
                        this._rotationX = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SpanStyles.prototype, "rotationY", {
                    /**
                     * Sets the Y-axis rotation property.
                     *
                     * @type {?number}
                     */
                    set: function(value) {
                        this._rotationY = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SpanStyles.prototype, "rotationZ", {
                    /**
                     * Sets the Z-axis rotation property.
                     *
                     * @type {?number}
                     */
                    set: function(value) {
                        this._rotationZ = SpanStyles._valueOrDefault(value, this._defaultStyle.rotationZ);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SpanStyles.prototype, "skewX", {
                    /**
                     * Sets the X-axis skew property.
                     *
                     * @type {?number}
                     */
                    set: function(value) {
                        this._skewX = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SpanStyles.prototype, "skewY", {
                    /**
                     * Sets the Y-axis skew property.
                     *
                     * @type {?number}
                     */
                    set: function(value) {
                        this._skewY = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(SpanStyles.prototype, "primaryColor", {
                    /**
                     * Gets the primary color property.
                     *
                     * @type {!libjass.parts.Color}
                     */
                    get: function() {
                        return this._primaryColor;
                    },
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
                Object.defineProperty(SpanStyles.prototype, "secondaryColor", {
                    /**
                     * Sets the secondary color property. null defaults it to the default style's value.
                     *
                     * @type {libjass.parts.Color}
                     */
                    set: function(value) {
                        this._secondaryColor = SpanStyles._valueOrDefault(value, this._defaultStyle.secondaryColor);
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
                     * Gets the primary alpha property.
                     *
                     * @type {?number}
                     */
                    get: function() {
                        return this._primaryAlpha;
                    },
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
                Object.defineProperty(SpanStyles.prototype, "secondaryAlpha", {
                    /**
                     * Sets the secondary alpha property.
                     *
                     * @type {?number}
                     */
                    set: function(value) {
                        this._secondaryAlpha = value;
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
                SpanStyles._getFontSize = function(fontFamily, lineHeight, fontSizeElement) {
                    var existingFontSizeMap = SpanStyles._fontSizeCache.get(fontFamily);
                    if (existingFontSizeMap === undefined) {
                        SpanStyles._fontSizeCache.set(fontFamily, existingFontSizeMap = new libjass.Map());
                    }
                    var existingFontSize = existingFontSizeMap.get(lineHeight);
                    if (existingFontSize === undefined) {
                        fontSizeElement.style.fontFamily = fontFamily;
                        fontSizeElement.style.fontSize = lineHeight + "px";
                        existingFontSizeMap.set(lineHeight, existingFontSize = lineHeight * lineHeight / fontSizeElement.offsetHeight);
                    }
                    return existingFontSize;
                };
                SpanStyles._fontSizeCache = new libjass.Map();
                SpanStyles._valueOrDefault = function(newValue, defaultValue) {
                    return newValue !== null ? newValue : defaultValue;
                };
                return SpanStyles;
            }();
            /**
             * This class represents an ASS drawing - a set of drawing instructions between {\p} tags.
             *
             * @param {number} outputScaleX
             * @param {number} outputScaleY
             *
             * @constructor
             * @memberOf libjass.renderers
             * @private
             */
            var DrawingStyles = function() {
                function DrawingStyles(outputScaleX, outputScaleY) {
                    this._outputScaleX = outputScaleX;
                    this._outputScaleY = outputScaleY;
                    this._scale = 1;
                    this._baselineOffset = 0;
                }
                Object.defineProperty(DrawingStyles.prototype, "scale", {
                    /**
                     * @type {number}
                     */
                    set: function(value) {
                        this._scale = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(DrawingStyles.prototype, "baselineOffset", {
                    /**
                     * @type {number}
                     */
                    set: function(value) {
                        this._baselineOffset = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * Converts this drawing to an <svg> element.
                 *
                 * @param {!libjass.parts.DrawingInstructions} drawingInstructions
                 * @param {!libjass.parts.Color} fillColor
                 * @return {!SVGSVGElement}
                 */
                DrawingStyles.prototype.toSVG = function(drawingInstructions, fillColor) {
                    var _this = this;
                    var scaleFactor = Math.pow(2, this._scale - 1);
                    var scaleX = this._outputScaleX / scaleFactor;
                    var scaleY = this._outputScaleY / scaleFactor;
                    var path = "";
                    var bboxWidth = 0;
                    var bboxHeight = 0;
                    drawingInstructions.instructions.forEach(function(instruction) {
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
                    var result = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + (bboxWidth * scaleX).toFixed(3) + 'px" height="' + (bboxHeight * scaleY).toFixed(3) + 'px">\n' + '	<g transform="scale(' + scaleX.toFixed(3) + " " + scaleY.toFixed(3) + ')">\n' + '		<path d="' + path + '" fill="' + fillColor.toString() + '" />\n' + "	</g>\n" + "</svg>";
                    return domParser.parseFromString(result, "image/svg+xml").childNodes[0];
                };
                return DrawingStyles;
            }();
            var domParser;
            if (typeof DOMParser !== "undefined") {
                domParser = new DOMParser();
            }
        })(libjass.renderers || (libjass.renderers = {}));
    })(libjass || (libjass = {}));
    (function(libjass) {
        (function(renderers) {
            /**
             * A default renderer implementation.
             *
             * @param {!HTMLVideoElement} video
             * @param {!libjass.ASS} ass
             * @param {!libjass.renderers.RendererSettings} settings
             *
             * @constructor
             * @extends {libjass.renderers.WebRenderer}
             * @memberOf libjass.renderers
             */
            var DefaultRenderer = function(_super) {
                __extends(DefaultRenderer, _super);
                function DefaultRenderer(video, ass, settings) {
                    _super.call(this, ass, new renderers.VideoClock(video), settings, document.createElement("div"));
                    this._video = video;
                    this._videoIsFullScreen = false;
                    this._video.parentElement.replaceChild(this.libjassSubsWrapper, this._video);
                    this.libjassSubsWrapper.insertBefore(this._video, this.libjassSubsWrapper.firstElementChild);
                }
                /**
                 * @deprecated
                 */
                DefaultRenderer.prototype.resizeVideo = function(width, height) {
                    console.warn("`DefaultRenderer.resizeVideo(width, height)` has been deprecated. Use `DefaultRenderer.resize(width, height)` instead.");
                    this.resize(width, height);
                };
                DefaultRenderer.prototype._ready = function() {
                    var _this = this;
                    document.addEventListener("mozfullscreenchange", function() {
                        return _this._onFullScreenChange(document.mozFullScreenElement);
                    }, false);
                    document.addEventListener("webkitfullscreenchange", function() {
                        return _this._onFullScreenChange(document.webkitFullscreenElement);
                    }, false);
                    document.addEventListener("fullscreenchange", function() {
                        return _this._onFullScreenChange(document.fullscreenElement);
                    }, false);
                    this.resize(this._video.offsetWidth, this._video.offsetHeight);
                    _super.prototype._ready.call(this);
                };
                DefaultRenderer.prototype._onFullScreenChange = function(fullScreenElement) {
                    if (fullScreenElement === undefined) {
                        fullScreenElement = document.msFullscreenElement;
                    }
                    if (fullScreenElement === this._video) {
                        this.libjassSubsWrapper.classList.add("libjass-full-screen");
                        this.resize(screen.width, screen.height);
                        this._videoIsFullScreen = true;
                        this._dispatchEvent("fullScreenChange", [ this._videoIsFullScreen ]);
                    } else if (fullScreenElement === null && this._videoIsFullScreen) {
                        this.libjassSubsWrapper.classList.remove("libjass-full-screen");
                        this._videoIsFullScreen = false;
                        this._dispatchEvent("fullScreenChange", [ this._videoIsFullScreen ]);
                    }
                };
                return DefaultRenderer;
            }(renderers.WebRenderer);
            renderers.DefaultRenderer = DefaultRenderer;
        })(libjass.renderers || (libjass.renderers = {}));
    })(libjass || (libjass = {}));
    (function(libjass) {
        /**
         * This class represents an ASS script. It contains the script properties, an array of Styles, and an array of Dialogues.
         *
         * @constructor
         * @memberOf libjass
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
             * @param {string} raw The raw text of the script.
             * @param {number=0} type The type of the script. One of the libjass.Format constants.
             * @return {!libjass.ASS}
             *
             * @static
             */
            ASS.fromString = function(raw, type) {
                if (typeof type === "undefined") {
                    type = 0;
                }
                raw = raw.replace(/\r$/gm, "");
                switch (type) {
                  case 0:
                    return ASS._fromASSString(raw);

                  case 1:
                    return ASS._fromSRTString(raw);

                  default:
                    throw new Error("Illegal value of type: " + type);
                }
            };
            ASS._fromASSString = function(rawASS) {
                var script = libjass.parser.parse(rawASS, "assScript");
                var result = new ASS();
                // Get the script info template
                var infoTemplate = script["Script Info"];
                if (libjass.verboseMode) {
                    console.log("Read script info: " + JSON.stringify(infoTemplate), infoTemplate);
                }
                // Parse the script properties
                result.properties.resolutionX = parseInt(infoTemplate["PlayResX"]);
                result.properties.resolutionY = parseInt(infoTemplate["PlayResY"]);
                result.properties.wrappingStyle = parseInt(infoTemplate["WrapStyle"]);
                result.properties.scaleBorderAndShadow = infoTemplate["ScaledBorderAndShadow"] === "yes";
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
            ASS._fromSRTString = function(rawSRT) {
                var script = libjass.parser.parse(rawSRT, "srtScript");
                var result = new ASS();
                // Parse the script properties
                result.properties.resolutionX = 1280;
                result.properties.resolutionY = 720;
                result.properties.wrappingStyle = 1;
                result.properties.scaleBorderAndShadow = true;
                var newStyle = new Style({
                    Name: "Default",
                    Italic: "0",
                    Bold: "0",
                    Underline: "0",
                    StrikeOut: "0",
                    Fontname: "",
                    Fontsize: "50",
                    ScaleX: "100",
                    ScaleY: "100",
                    Spacing: "0",
                    Angle: "0",
                    PrimaryColour: "&H0000FFFF",
                    SecondaryColour: "&H00000000",
                    OutlineColour: "&H00000000",
                    BackColour: "&H00000000",
                    Outline: "1",
                    BorderStyle: "1",
                    Shadow: "1",
                    Alignment: "2",
                    MarginL: "80",
                    MarginR: "80",
                    MarginV: "35"
                });
                result.styles[newStyle.name] = newStyle;
                script.sort(function(line1, line2) {
                    return line1["number"] - line2["number"];
                }).forEach(function(line) {
                    result.dialogues.push(new Dialogue({
                        Style: "Default",
                        Start: line.start,
                        End: line.end,
                        Layer: "0",
                        Text: line.text.replace("<b>", "{\\b1}").replace("</b>", "{\\b0}").replace("<i>", "{\\i1}").replace("</i>", "{\\i0}").replace("<u>", "{\\u1}").replace("</u>", "{\\u0}").replace(/<font color="#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})">/g, function(substring, red, green, blue) {
                            return "{c&H" + blue + green + red + "&}";
                        }).replace("</font>", "{\\c}")
                    }, result));
                });
                return result;
            };
            return ASS;
        }();
        libjass.ASS = ASS;
        (function(Format) {
            Format[Format["ASS"] = 0] = "ASS";
            Format[Format["SRT"] = 1] = "SRT";
        })(libjass.Format || (libjass.Format = {}));
        (function(WrappingStyle) {
            WrappingStyle[WrappingStyle["SmartWrappingWithWiderTopLine"] = 0] = "SmartWrappingWithWiderTopLine";
            WrappingStyle[WrappingStyle["SmartWrappingWithWiderBottomLine"] = 3] = "SmartWrappingWithWiderBottomLine";
            WrappingStyle[WrappingStyle["EndOfLineWrapping"] = 1] = "EndOfLineWrapping";
            WrappingStyle[WrappingStyle["NoLineWrapping"] = 2] = "NoLineWrapping";
        })(libjass.WrappingStyle || (libjass.WrappingStyle = {}));
        /**
         * This class represents the properties of an ASS script.
         *
         * @constructor
         * @memberOf libjass
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
            Object.defineProperty(ScriptProperties.prototype, "wrappingStyle", {
                /**
                 * The wrap style.
                 *
                 * @type {number}
                 */
                get: function() {
                    return this._wrappingStyle;
                },
                /**
                 * The wrap style.
                 *
                 * @type {number}
                 */
                set: function(value) {
                    this._wrappingStyle = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ScriptProperties.prototype, "scaleBorderAndShadow", {
                /**
                 * Whether to scale outline widths and shadow depths from script resolution to video resolution or not. If true, widths and depths are scaled.
                 *
                 * @type {boolean}
                 */
                get: function() {
                    return this._scaleBorderAndShadow;
                },
                /**
                 * Whether to scale outline widths and shadow depths from script resolution to video resolution or not. If true, widths and depths are scaled.
                 *
                 * @type {boolean}
                 */
                set: function(value) {
                    this._scaleBorderAndShadow = value;
                },
                enumerable: true,
                configurable: true
            });
            return ScriptProperties;
        }();
        libjass.ScriptProperties = ScriptProperties;
        (function(BorderStyle) {
            BorderStyle[BorderStyle["Outline"] = 1] = "Outline";
            BorderStyle[BorderStyle["OpaqueBox"] = 3] = "OpaqueBox";
        })(libjass.BorderStyle || (libjass.BorderStyle = {}));
        /**
         * This class represents a single global style declaration in an ASS script. The styles can be obtained via the ASS.styles property.
         *
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
         * @constructor
         * @memberOf libjass
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
                this._rotationZ = parseFloat(template["Angle"]);
                this._primaryColor = libjass.parser.parse(template["PrimaryColour"], "colorWithAlpha");
                this._secondaryColor = libjass.parser.parse(template["SecondaryColour"], "colorWithAlpha");
                this._outlineColor = libjass.parser.parse(template["OutlineColour"], "colorWithAlpha");
                this._shadowColor = libjass.parser.parse(template["BackColour"], "colorWithAlpha");
                this._outlineThickness = parseFloat(template["Outline"]);
                this._borderStyle = parseInt(template["BorderStyle"]);
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
            Object.defineProperty(Style.prototype, "rotationZ", {
                /**
                 * The default Z-rotation of this style.
                 *
                 * @type {number}
                 */
                get: function() {
                    return this._rotationZ;
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
            Object.defineProperty(Style.prototype, "secondaryColor", {
                /**
                 * The alternate color of this style's font, used in karaoke.
                 *
                 * @type {!libjass.parts.Color}
                 */
                get: function() {
                    return this._secondaryColor;
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
            Object.defineProperty(Style.prototype, "borderStyle", {
                /**
                 * The border style of this style.
                 *
                 * @type {number}
                 */
                get: function() {
                    return this._borderStyle;
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
         * @param {!Object} template The template object that contains the dialogue's properties. It is a map of the string values read from the ASS file.
         * @param {string} template["Style"] The name of the default style of this dialogue
         * @param {string} template["Start"] The start time
         * @param {string} template["End"] The end time
         * @param {string} template["Layer"] The layer number
         * @param {string} template["Text"] The text of this dialogue
         * @param {ASS} ass The ASS object to which this dialogue belongs
         *
         * @constructor
         * @memberOf libjass
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
             *
             * @private
             */
            Dialogue.prototype._parsePartsString = function() {
                var _this = this;
                this._parts = libjass.parser.parse(this._rawPartsString, "dialogueParts");
                this._alignment = this._style.alignment;
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
             * @param {string} str
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