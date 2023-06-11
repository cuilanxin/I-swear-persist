# 旋转 
## 坐标 (x, y) 旋转 rotate(R)deg 后坐标 (x', y')， A 是 webgl 的中心点与坐标的度数   

## 结论 
```Math
  x = cosA * 斜
  y = sinA * 斜
  x' = x * cosR - y * sinR
  y' = x * sinR + y * cosR
```

### <span style="color: red">坐标: x</span>   

```Math
  cosA = 临(x) / 斜
  x = cosA * 斜
```   

### <span style="color: red">坐标: y</span>   

```Math
  sinA = 对(y) / 斜
  y = sinA * 斜
```   

## 坐标 (x', y')，需要得到旋转角度 rotate(R)， 旋转方向(以加为例)   

```Math  
  sin(A + R) = sinA * cosR + cosA * sinR
  cos(A + R) = cosA * cosR - sinA * sinR
```  

### <span style="color: red">坐标: x'</span>   

```Math
  cos(A + R) = 临(x') / 斜
  cosA * cosR - sinA * sinR = x' / 斜
  x' = (cosA * cosR - sinA * sinR) * 斜
  x' = cosA * 斜 * cosR - sinA * 斜 * sinR
  x' = x * cosR - y * sinR
```   

### <span style="color: red">坐标: y'</span>   
    
```Math  
  sin(A + R) = 对边(y') / 斜
  sinA * cosR + cosA * sinR = y' / 斜
  y' = (sinA * cosR + cosA * sinR) * 斜
  y' = sinA * 斜 * cosR + cosA * 斜 * sinR
  y' = y * cosR + x * sinR
```   