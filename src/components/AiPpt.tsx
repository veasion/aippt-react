import { useState, useEffect } from 'react'
import GenerateOutline from './GenerateOutline.tsx'
import SelectTemplate from './SelectTemplate.tsx'
import GeneratePpt from './GeneratePpt.tsx'

// 文多多AiPPT
// 官网 https://docmee.cn
// 开放平台 https://docmee.cn/open-platform/api#接口鉴权

// api key
const apiKey = ''
// 用户ID（数据隔离）
const uid = 'test'

function AiPpt() {
  const [step, setStep] = useState(1)
  const [outline, setOutline] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [token, setToken] = useState('')

  async function createApiToken() {
    if (!apiKey) {
      alert('请在代码中设置apiKey')
      return
    }
    const url = 'https://chatmee.cn/api/user/createApiToken'
    const resp = await (await fetch(url, {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uid,
        limit: null
      })
    })).json()
    if (resp.code != 0) {
      alert('创建接口token异常：' + resp.message)
      return
    }
    setToken(resp.data.token)
  }

  useEffect(() => {
    createApiToken()
  }, [])

  return (
    <>
      <div>
        {step == 1 && (
            <GenerateOutline token={token} nextStep={(outline)=> {
                setStep(step => step + 1)
                setOutline(() => outline)
            }} />
        )}
        {step == 2 && (
            <SelectTemplate token={token} nextStep={(id)=> {
                setStep(step => step + 1)
                setTemplateId(() => id)
            }} />
        )}
        {step == 3 && (
            <GeneratePpt token={token} params={{ outline, templateId }} />
        )}
      </div>
    </>
  )
}

export default AiPpt
