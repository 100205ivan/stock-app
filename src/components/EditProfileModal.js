import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function EditProfileModal({ visible, onClose, initialData, onSave }) {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');

  // 用來顯示大頭貼預覽文字
  const avatarText = name.trim() ? name.trim().charAt(0).toUpperCase() : 'U';

  useEffect(() => {
    if (visible && initialData) {
      setName(initialData.name || '');
      setEmail(initialData.email || '');
      setBio(initialData.bio || '');
    }
  }, [visible, initialData]);

  const handleSave = () => {
    if (!name.trim()) {
      // 這裡可以用簡單的震動或紅框提示，這邊先用 alert
      alert('請輸入暱稱');
      return;
    }
    const avatarInitials = name.trim().charAt(0).toUpperCase();
    onSave({ name, email, bio, avatarInitials });
    onClose();
  };

  // 輸入框組件 (封裝以保持程式碼整潔)
  const InputField = ({ label, icon, value, onChange, placeholder, keyboardType }) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
        <Ionicons name={icon} size={20} color={theme.colors.textTertiary} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          {/* 半透明背景點擊關閉 */}
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={[styles.sheetContainer, { backgroundColor: theme.colors.card }]}>
              
              {/* 頂部拖曳條示意 */}
              <View style={styles.dragHandleBar}>
                <View style={[styles.dragHandle, { backgroundColor: theme.colors.border }]} />
              </View>

              {/* 標題列 */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text }]}>編輯個人資料</Text>
                <Pressable onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close-circle" size={28} color={theme.colors.textSecondary} />
                </Pressable>
              </View>

              {/* 大頭貼預覽區 (視覺重心) */}
              <View style={styles.avatarSection}>
                <View style={[styles.avatarCircle, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Text style={[styles.avatarText, { color: theme.colors.primary }]}>{avatarText}</Text>
                  {/* 相機小圖示 (裝飾用) */}
                  <View style={[styles.cameraBadge, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <Ionicons name="camera" size={14} color={theme.colors.textSecondary} />
                  </View>
                </View>
              </View>

              {/* 表單區 */}
              <View style={styles.form}>
                <InputField 
                  label="暱稱" 
                  icon="person-outline" 
                  value={name} 
                  onChange={setName} 
                  placeholder="您的暱稱" 
                />
                
                <InputField 
                  label="Email" 
                  icon="mail-outline" 
                  value={email} 
                  onChange={setEmail} 
                  placeholder="name@example.com" 
                  keyboardType="email-address"
                />
                
                <InputField 
                  label="會員標籤 / 簡介" 
                  icon="pricetag-outline" 
                  value={bio} 
                  onChange={setBio} 
                  placeholder="例如：短線交易員" 
                />

                <Pressable
                  style={({ pressed }) => [
                    styles.saveButton,
                    { 
                      backgroundColor: theme.colors.primary,
                      opacity: pressed ? 0.9 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }]
                    }
                  ]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>儲存變更</Text>
                </Pressable>
              </View>
              
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  keyboardView: {
    width: '100%',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    // 陰影效果
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  dragHandleBar: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeButton: {
    padding: 4,
  },
  
  // 大頭貼樣式
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 表單樣式
  form: {
    paddingHorizontal: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14, // 更圓潤
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  
  // 按鈕樣式
  saveButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});