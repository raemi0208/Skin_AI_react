import React from 'react';

const UserInfoModal = ({ userId, userIp, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-box" style={{ maxWidth: '400px', padding: '30px' }}>
                <button className="modal-close-btn" onClick={onClose}>✕</button>

                <h3 className="modal-title" style={{ marginBottom: '20px' }}>
                    사용자 접속 정보
                </h3>

                {/* User ID */}
                <div style={{ marginBottom: '15px' }}>
                    <p style={{
                        margin: '0 0 5px 0',
                        fontWeight: 'bold',
                        color: '#555'
                    }}>
                        임시 사용자 ID:
                    </p>
                    <p style={{
                        margin: 0,
                        padding: '10px',
                        backgroundColor: '#f9f9f9',
                        border: '1px solid #eee',
                        borderRadius: '4px',
                        wordBreak: 'break-all',
                        fontSize: '14px'
                    }}>
                        {userId}
                    </p>
                </div>

                {/* User IP */}
                <div>
                    <p style={{
                        margin: '0 0 5px 0',
                        fontWeight: 'bold',
                        color: '#555'
                    }}>
                        접속 IP 주소:
                    </p>
                    <p style={{
                        margin: 0,
                        padding: '10px',
                        backgroundColor: '#f9f9f9',
                        border: '1px solid #eee',
                        borderRadius: '4px',
                        wordBreak: 'break-all',
                        fontSize: '14px'
                    }}>
                        {userIp}
                    </p>
                </div>

                <p style={{
                    marginTop: '20px',
                    fontSize: '12px',
                    color: '#888'
                }}>
                    * 이 ID는 브라우저에 저장된 임시 식별자입니다.  
                      IP 주소는 외부 API를 통해 로딩됩니다.
                </p>
            </div>
        </div>
    );
};

export default UserInfoModal;
