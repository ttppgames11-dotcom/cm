import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function CommunityFeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [newPostText, setNewPostText] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedGroup]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [postsRes, groupsRes] = await Promise.all([
        api.community.getPosts(selectedGroup),
        api.community.getGroups()
      ]);
      if (postsRes && postsRes.posts) setPosts(postsRes.posts);
      if (groupsRes && groupsRes.groups) setGroups(groupsRes.groups);
    } catch (err) {
      console.warn('Error loading community data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.community.createPost({
        author_id: user?.id || 'M1001',
        author_name: user?.name || 'अमोल जाधव',
        author_avatar: user?.avatar || '👨',
        group_id: selectedGroup || 'G09',
        text: newPostText
      });

      if (res && res.post) {
        setPosts([res.post, ...posts]);
        setNewPostText('');
      }
    } catch (err) {
      alert('पोस्ट करताना त्रुटी आली: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await api.community.likePost(postId);
      setPosts(posts.map(p => p.id === postId ? { ...p, likes_count: res.likes_count } : p));
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await api.community.addComment(postId, {
        author_id: user?.id || 'M1001',
        author_name: user?.name || 'अमोल जाधव',
        text
      });

      if (res && res.comments) {
        setPosts(posts.map(p => p.id === postId ? { ...p, comments: res.comments } : p));
        setCommentInputs({ ...commentInputs, [postId]: '' });
      }
    } catch (err) {
      alert('प्रतिक्रिया देताना त्रुटी: ' + err.message);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await api.community.joinGroup(groupId);
      alert('आपण या गटात यशस्वीरित्या सामील झालात!');
      setGroups(groups.map(g => g.id === groupId ? { ...g, members_count: (g.members_count || 0) + 1 } : g));
    } catch (err) {
      console.error('Join error:', err);
    }
  };

  return (
    <div style={{ background: '#FBF5EC', minHeight: '100vh', padding: '36px 0' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Page Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #C73800, #E65100)',
          borderRadius: '16px',
          color: '#fff',
          padding: '32px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 25px rgba(199,56,0,0.2)'
        }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
              🚩 मराठा समुदाय संवाद
            </span>
            <h1 style={{ fontSize: '2.2rem', margin: '10px 0 6px', fontFamily: 'Baloo 2' }}>
              मराठा समुदाय व संवाद मंच
            </h1>
            <p style={{ margin: 0, opacity: 0.92, fontSize: '1.05rem', maxWidth: '65ch' }}>
              महाराष्ट्रासह देश-विदेशातील मराठा बांधवांचे विचारमंथन, स्थानिक गट, सामाजिक उपक्रम आणि परस्पर सहकार्याचे महाव्यासपीठ.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/card" className="btn btn-primary" style={{ background: '#fff', color: '#C73800', border: 'none', padding: '10px 18px', fontWeight: 700, borderRadius: '8px' }}>
              🪪 सदस्य ओळखपत्र
            </Link>
          </div>
        </div>

        {/* 2-Column Layout: Sidebar (Groups) + Main Feed */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '28px', alignItems: 'start' }}>
          
          {/* Left Column: Community Groups */}
          <div>
            <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', margin: '0 0 16px', color: '#C73800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>👥</span> मराठा समुदाय गट
              </h3>
              
              <button
                onClick={() => setSelectedGroup('')}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: selectedGroup === '' ? '#FFF3E0' : 'transparent',
                  color: selectedGroup === '' ? '#C73800' : '#4B5563',
                  fontWeight: selectedGroup === '' ? 700 : 500,
                  cursor: 'pointer',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                <span>🌐 सर्वसमावेशक मुख्य फीड</span>
                <span style={{ fontSize: '0.8rem', background: '#FFCC80', padding: '2px 8px', borderRadius: '10px' }}>सर्व</span>
              </button>

              <div style={{ maxHeight: '460px', overflowY: 'auto', paddingRight: '4px' }}>
                {groups.map(group => (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroup(group.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      background: selectedGroup === group.id ? '#FFF3E0' : '#F9FAFB',
                      border: selectedGroup === group.id ? '1px solid #FFB74D' : '1px solid #F3F4F6',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: selectedGroup === group.id ? '#C73800' : '#1F2937' }}>
                        {group.cover} {group.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                        {group.members_count} सदस्य
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280', lineHeight: 1.4 }}>
                      {group.desc}
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleJoinGroup(group.id); }}
                      style={{
                        marginTop: '8px',
                        background: 'none',
                        border: '1px solid #E65100',
                        color: '#E65100',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}>
                      + सामील व्हा
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Community Helpline widget */}
            <div style={{ background: '#FFF8F2', borderRadius: '14px', padding: '18px', border: '1px solid #FFCC80' }}>
              <div style={{ fontWeight: 700, color: '#C73800', marginBottom: '6px', fontSize: '0.95rem' }}>
                🤝 आणीबाणी समाज साहाय्य
              </div>
              <p style={{ fontSize: '0.82rem', color: '#555', margin: '0 0 10px', lineHeight: 1.5 }}>
                रक्तदान, वैद्यकीय मदत किंवा संकटसमयी २४/७ मराठा हेल्पलाइनशी थेट संपर्क साधा.
              </p>
              <div style={{ fontWeight: 800, color: '#C73800', fontSize: '1.1rem' }}>
                📞 १८००-२३३-१९८१
              </div>
            </div>
          </div>

          {/* Right Column: Post Composer & Live Posts Feed */}
          <div>
            
            {/* Post Composer */}
            <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '2rem' }}>{user?.avatar || '👨'}</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#1F2937' }}>{user?.name || 'अमोल जाधव'}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>आपले विचार किंवा उपक्रम समाजासोबत शेअर करा</div>
                </div>
              </div>

              <form onSubmit={handleCreatePost}>
                <textarea
                  rows="3"
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="जय शिवराय! आजचा उपक्रम, ऐतिहासिक विचार किंवा समाजोपयोगी संदेश लिहा..."
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid #D1D5DB',
                    fontFamily: 'inherit',
                    fontSize: '0.95rem',
                    resize: 'vertical',
                    marginBottom: '12px',
                    outline: 'none'
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>
                    🚩 मराठा बंधुभाव
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !newPostText.trim()}
                    className="btn btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #C73800, #E65100)',
                      border: 'none',
                      color: '#fff',
                      padding: '8px 22px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: newPostText.trim() ? 'pointer' : 'not-allowed',
                      opacity: newPostText.trim() ? 1 : 0.6
                    }}>
                    {submitting ? 'प्रसिद्ध होत आहे...' : 'प्रसिद्ध करा (Post) 🚀'}
                  </button>
                </div>
              </form>
            </div>

            {/* Posts List */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                लोड होत आहे... कृपया थांबा ⏳
              </div>
            ) : posts.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '14px', padding: '40px', textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📭</div>
                <h3>या गटात अजून कोणतीही पोस्ट नाही.</h3>
                <p>पहिली पोस्ट करून संवादाला सुरुवात करा!</p>
              </div>
            ) : (
              posts.map(post => (
                <div
                  key={post.id}
                  style={{
                    background: '#fff',
                    borderRadius: '14px',
                    padding: '24px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    marginBottom: '20px'
                  }}>
                  {/* Post Author Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.8rem' }}>{post.author_avatar || '👤'}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1F2937' }}>{post.author_name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>
                          {new Date(post.created_at || Date.now()).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <span style={{ background: '#FFF3E0', color: '#E65100', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                      🚩 समाज मंच
                    </span>
                  </div>

                  {/* Post Content */}
                  <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: '#1F2937', margin: '0 0 16px' }}>
                    {post.text}
                  </p>

                  {/* Post Image (if any) */}
                  {post.image && (
                    <div style={{ borderRadius: '10px', overflow: 'hidden', marginBottom: '16px', maxHeight: '380px' }}>
                      <img src={post.image} alt="Post media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                  )}

                  {/* Post Interactions (Likes & Comments Count) */}
                  <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid #F3F4F6', paddingTop: '12px', alignItems: 'center' }}>
                    <button
                      onClick={() => handleLike(post.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#C73800',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                      <span>❤️ आवडले</span>
                      <span>({post.likes_count || 0})</span>
                    </button>

                    <button
                      onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#4B5563',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                      <span>💬 प्रतिक्रिया</span>
                      <span>({post.comments ? post.comments.length : 0})</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {activeCommentPost === post.id && (
                    <div style={{ marginTop: '16px', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
                      {/* Existing comments */}
                      <div style={{ marginBottom: '14px' }}>
                        {post.comments && post.comments.length > 0 ? (
                          post.comments.map((c, i) => (
                            <div key={i} style={{ background: '#F9FAFB', padding: '10px 14px', borderRadius: '8px', marginBottom: '8px' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1F2937' }}>{c.author_name}</div>
                              <div style={{ fontSize: '0.9rem', color: '#4B5563' }}>{c.text}</div>
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>अजून कोणतीही प्रतिक्रिया नाही. पहिली प्रतिक्रिया द्या!</div>
                        )}
                      </div>

                      {/* Add comment input */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="आपली प्रतिक्रिया लिहा..."
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id); }}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #D1D5DB',
                            fontFamily: 'inherit',
                            fontSize: '0.9rem'
                          }}
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          style={{
                            background: '#C73800',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}>
                          पाठवा
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
