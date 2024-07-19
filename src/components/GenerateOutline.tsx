import { useState, useEffect, useCallback } from 'react'
import { marked } from 'marked'
import { SSE } from '../utils/sse.js'
import '../styles/GenerateOutline.css'

let subject = ''
let outline = ''

marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    async: false,
    breaks: false,
    pedantic: false,
    silent: true
})

function GenerateOutline({token, nextStep}: { token: string, nextStep: (outline: string) => void}) {
    const [genDone, setGenDone] = useState(false)
    const [outlineHtml, setOutlineHtml] = useState('')

    const generateOutline = useCallback(() => {
        if (!subject) {
            alert('请输入主题')
            return
        }
        console.log('主题', subject)
        const url = 'https://chatmee.cn/api/ppt/generateOutline'
        const source = new SSE(url, {
            method: 'POST',
            // withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'token': token
            },
            payload: JSON.stringify({ subject: subject }),
        })
        source.onmessage = function (data: any) {
            const json = JSON.parse(data.data)
            if (json.status == -1) {
                alert('生成大纲异常：' + json.error)
                return
            }
            outline = outline + json.text
            const outlineHtml = marked.parse(outline.replace('```markdown', '').replace(/```/g, '')) as string
            setOutlineHtml(outlineHtml)
        }
        source.onend = function (data: any) {
            if (data.data.startsWith('{') && data.data.endWith('}')) {
                const json = JSON.parse(data.data)
                if (json.code != 0) {
                    alert('生成大纲异常：' + json.message)
                    return
                }
            }
            setGenDone(true)
        }
        source.onerror = function (err: any) {
            console.error('生成大纲异常', err)
            alert('生成大纲异常')
        }
        source.stream()
    }, [token])

    useEffect(() => {
        if (outlineHtml) {
            window.scrollTo({ behavior: 'smooth', top: document.body.scrollHeight })
        }
    }, [outlineHtml])

    useEffect(() => {
        genDone && window.scrollTo(0, 0)
    }, [genDone])

    return (
      <>
        <div className="outline_content">
            <h1>🤖 AI智能生成PPT演示文稿</h1>
            <div className="outline_desc">生成大纲 ---&gt; 挑选模板 --&gt; 实时生成PPT</div>
            <div>
                <span>主题：</span>
                <input placeholder="请输入PPT主题" onChange={(e) => subject = e.target.value } />
                <button onClick={generateOutline}>生成大纲</button>
                { genDone && <button onClick={() => nextStep(outline) }>下一步：选择模板</button> }
            </div>
            <div className="outline" dangerouslySetInnerHTML={{__html: outlineHtml}}></div>
        </div>
      </>
    )
  }
  
  export default GenerateOutline